import {
  Body, Controller, Get, Ip, Param, ParseIntPipe, Post, Query, Req, UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { Public } from 'src/common/decorators';
import { ContactService } from '../contact/contact.service';
import { CreateContactDto } from '../contact/dto/contact.dto';
import { EventQueryDto } from '../events/dto/event.dto';
import { PostQueryDto } from '../posts/dto/post.dto';
import { PublicService } from './public.service';

@ApiTags('public')
@Public()
@Controller('public')
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(
    private readonly service: PublicService,
    private readonly contact: ContactService,
  ) {}

  @Get('bootstrap')
  @CacheTTL(300_000)
  bootstrap() {
    return this.service.bootstrap();
  }

  @Get('committees')
  committees() {
    return this.service.listCommittees();
  }

  @Get('committees/:year')
  committee(@Param('year', ParseIntPipe) year: number) {
    return this.service.committeeByYear(year);
  }

  @Get('founding-members')
  founding() {
    return this.service.foundingMembers();
  }

  @Get('advisors')
  advisors() {
    return this.service.advisorList();
  }

  @Get('gallery')
  gallery(@Query('limit') limit?: string) {
    return this.service.galleryFeed(limit ? Math.min(Number(limit), 60) : 30);
  }

  @Get('gallery/albums')
  albums() {
    return this.service.galleryAlbums();
  }

  @Get('gallery/albums/:slug')
  album(@Param('slug') slug: string) {
    return this.service.galleryAlbum(slug);
  }

  @Get('events')
  events(@Query() dto: EventQueryDto) {
    return this.service.eventList(dto);
  }

  @Get('events/:slug')
  event(@Param('slug') slug: string) {
    return this.service.eventBySlug(slug);
  }

  @Get('posts')
  posts(@Query() dto: PostQueryDto) {
    return this.service.postList(dto);
  }

  @Get('posts/:slug')
  post(@Param('slug') slug: string) {
    return this.service.postBySlug(slug);
  }

  @Get('snapshot')
  @CacheTTL(600_000)
  snapshot() {
    return this.service.snapshot();
  }

  @Get('sitemap')
  @CacheTTL(600_000)
  sitemap() {
    return this.service.sitemap();
  }

  @Post('contact')
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  submitContact(@Body() dto: CreateContactDto, @Ip() ip: string, @Req() req: Request) {
    return this.contact.submit(dto, ip, req.headers['user-agent']);
  }
}
