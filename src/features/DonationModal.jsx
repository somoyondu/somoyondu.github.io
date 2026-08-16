import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import DonationCard from '../components/Donation/DonationCard';
import { useSettings } from '../context/SettingsContext';

const DonationModal = ({ isOpen, setIsOpen }) => {
  const { settings } = useSettings();
  const donation = settings.donation ?? {};
  const closeModal = () => setIsOpen(false);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 lg:p-14 m-4 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h2" className="text-3xl lg:text-4xl text-center font-medium text-gray-900">
                  {donation.title ?? 'দান'}
                </Dialog.Title>

                <p className="text-md text-black py-6 lg:py-9 text-center whitespace-pre-line">
                  {donation.description}
                </p>

                <DonationCard />

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                    onClick={closeModal}
                  >
                    ধন্যবাদ
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DonationModal;
