import React from 'react';
import { Check } from 'lucide-react';

const OrderReview = () => {
  const orderDetails = {
    clientInfo: {
      name: "John Doe",
      unitNumber: "A-123"
    },
    floorPlan: "Investor",
    selections: {
      "Living Room": {
        "Sofa": {
          material: "Fabric",
          color: "Gray",
          style: "Modern"
        },
        "Coffee Table": {
          material: "Glass",
          color: "Clear",
          style: "Round"
        }
      },
      "Dining Room": {
        "Dining Table": {
          material: "Wood",
          color: "Natural",
          style: "Rectangle"
        },
        "Dining Chairs": {
          material: "Wood",
          color: "Natural",
          style: "Modern"
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>
        Order Review
      </h2>

      {/* Client Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4" style={{ color: '#005670' }}>
          Client Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Name</label>
            <p className="font-medium">{orderDetails.clientInfo.name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Unit Number</label>
            <p className="font-medium">{orderDetails.clientInfo.unitNumber}</p>
          </div>
        </div>
      </div>

      {/* Selections Summary */}
      {Object.entries(orderDetails.selections).map(([room, furniture]) => (
        <div key={room} className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium mb-4" style={{ color: '#005670' }}>
            {room}
          </h3>
          <div className="space-y-4">
            {Object.entries(furniture).map(([item, specs]) => (
              <div key={item} className="border-b pb-4">
                <h4 className="font-medium mb-2">{item}</h4>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(specs).map(([spec, value]) => (
                    <div key={spec}>
                      <label className="block text-sm text-gray-600">{spec}</label>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderReview;