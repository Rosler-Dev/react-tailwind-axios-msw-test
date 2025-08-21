import React, { memo } from "react";

interface TourCardProps {
  imgSrc: string,
  name: string,
  description: string,
  price: string,
  hasTickets: boolean,
  onBooking: () => void,
}

const TourCard = memo(function TourCardMemo({imgSrc, name, description, price, hasTickets, onBooking}: TourCardProps) {
  const bookingClasses = hasTickets ? "cursor-pointer will-change-transform transition-shadow hover:shadow-xl transition-transform hover:translate-y-[-8px]" : "";
  return (
    <div className={`flex flex-col border border-1 border-solid border-gray-200 ${bookingClasses}`} onClick={onBooking}>
      <img src={imgSrc} />
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-1 flex-col p-2">
          <h1 className="font-bold text-xl mt-1">{name}</h1>
          <p className="mt-1 mb-1.5">{description}</p>
          <div className='mt-auto'>
            {hasTickets
              ? <p className="font-bold text-md">{`${price} for your group.`}</p>
              : <p className="font-bold text-md">Please Select Tickets</p>
            }
          </div>
       
        </div>
        {hasTickets && <div className="text-center font-bold text-md text-white mt-2 px-2 py-1 w-full bg-purple-700">Book Now</div>}
      </div>
    </div>
  );
});

export default TourCard;