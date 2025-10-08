import React from 'react';
import { Button, Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ITourEnhanced } from "../types";

interface IBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tour?: ITourEnhanced;
}

export default function BookingDialog(props: IBookingDialogProps) {
  const { isOpen, onClose, tour } = props;

  return (
    <Dialog open={isOpen} onClose={onClose} as="div" className="relative z-10 focus:outline-none">
      <DialogBackdrop transition className="fixed inset-0 bg-black/30 duration-800 ease-out data-closed:opacity-0" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel as="div" transition className="w-full max-w-md rounded-xl bg-white p-6 duration-300 ease-out data-closed:scale-95 data-closed:opacity-0">
            <DialogTitle as="h3" className="text-xl font-bold">Tour Successfully Booked</DialogTitle>
            {tour &&
              <Description className="mt-4">Have fun on your {tour.name}!</Description>
            }
            <div className="flex gap-4 mt-6">
              <Button
                className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                onClick={onClose}
              >
                OK
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
