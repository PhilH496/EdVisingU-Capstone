// Step 5: Equipment and services being requested
// ServiceAndEquip Component Goes Here
//
// HELPFUL INFO:
// - formData: Object containing all form data (see @/types/bswd.ts for available fields)
// - setFormData: Updates form data using: setFormData(prev => ({ ...prev, fieldName: value }))
// - Reference StudentInfoStep.tsx for examples
// - Add validation in index.tsx > isStepComplete() function
// - Use brand colors located in tailwind.config.js; reference StudentInfoStep.tsx

import { FormData } from "@/types/bswd";
import { useState } from "react";

interface ServiceAndEquipProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

// Main component
export function ServiceAndEquip({
  formData,
  setFormData,
}: ServiceAndEquipProps) {
  const [tabFocus, setTabFocus] = useState("equipment");
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Database mock up
  const availableEquip = [
    {
      id: 1,
      name: "Computer/Laptop",
      cap: 3500,
      bswdEligible: true,
      csgdseEligible: true,
    },
    {
      id: 2,
      name: "Tablet",
      cap: 800,
      bswdEligible: true,
      csgdseEligible: true,
    },
    {
      id: 3,
      name: "Screen Reading Software",
      cap: 2600,
      bswdEligible: true,
      csgdseEligible: true,
    },
  ];

  // Database mock up
  const availableServies = [
    {
      id: 1,
      name: "Note-taking Services",
      cap: "1,500 | per course or $1,000 per license",
      bswdEligible: true,
      csgdseEligible: true,
    },
    {
      id: 2,
      name: "Tutoring Services",
      cap: "2,200 | per course, $35/hour max",
      bswdEligible: true,
      csgdseEligible: true,
    },
    {
      id: 3,
      name: "ADD/ADHD Coaching",
      cap: "2,000 | BSWD only, per academic year",
      bswdEligible: true,
      csgdseEligible: false,
    },
  ];

  const handleAddAll = () => {
    const currentItems = tabFocus === "equipment" ? availableEquip : availableServies;
    const itemType = tabFocus === "equipment" ? "Equipment" : "Service";
    
    // Check if items from this category already exist
    const existingItemsFromCategory = formData.requestedItems.filter(
      item => item.category === itemType
    );
    
    // Check if all items are already added
    const allItemsAlreadyAdded = currentItems.every(currentItem =>
      existingItemsFromCategory.some(existing => existing.item === currentItem.name)
    );
    
    if (allItemsAlreadyAdded && existingItemsFromCategory.length > 0) {
      // Show warning message
      setShowDuplicateWarning(true);
      // Hide warning after 3 seconds
      setTimeout(() => setShowDuplicateWarning(false), 3000);
      return;
    }
    
    // Create RequestedItem objects for items that don't exist yet
    const newItems = currentItems
      .filter(item => !existingItemsFromCategory.some(existing => existing.item === item.name))
      .map(item => ({
        category: itemType,
        item: item.name,
        cost: typeof item.cap === 'number' ? item.cap : 0,
        justification: `${itemType} requested for disability support`,
        fundingSource: (item.bswdEligible && item.csgdseEligible) ? 'both' : 
                       (item.bswdEligible ? 'bswd' : 'csg-dse') as 'bswd' | 'csg-dse' | 'both'
      }));
    
    console.log('Adding items:', newItems);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        requestedItems: [...prev.requestedItems, ...newItems]
      };
      console.log('Updated formData:', updated.requestedItems);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Section F: Services and Equipment</h2>
      
      {/* Display duplicate warning */}
      {showDuplicateWarning && (
        <div className="bg-yellow-50 border border-yellow-400 rounded-md p-3 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ All {tabFocus === "equipment" ? "equipment" : "services"} have already been added. Cannot add duplicates.
          </p>
        </div>
      )}
      
      {/* Display current requested items count */}
      {formData.requestedItems && formData.requestedItems.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-sm text-green-800">
            <strong>{formData.requestedItems.length}</strong> item(s) currently requested
          </p>
        </div>
      )}
      
      {/* 
        Display TabBar component based on focus status
        < Focusing on Equipment or Services > 
      */}
      {<TabBar tabFocus={tabFocus} setTabFocus={setTabFocus} />}
      {tabFocus === "equipment" ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Disability-Related Equipment
            </h2>
            <button 
              onClick={handleAddAll}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Add All Equipment
            </button>
          </div>
          {availableEquip.map((equip) => {
            return <Item key={equip.id} itemInfo={equip} type={tabFocus} />;
          })}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Disability-Related Services
            </h2>
            <button 
              onClick={handleAddAll}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Add All Services
            </button>
          </div>
          {availableServies.map((equip) => {
            return <Item key={equip.id} itemInfo={equip} type={tabFocus} />;
          })}
        </>
      )}
    </div>
  );
}

interface TabFocusProps {
  tabFocus: String;
  setTabFocus: (data: string | ((prev: string) => string)) => void;
}

// TabBar compoennt
const TabBar = ({ tabFocus, setTabFocus }: TabFocusProps) => {
  return (
    <div className="grid grid-cols-2 bg-gray-200 text-center rounded-md">
      <button
        className={
          "m-1 py-0.5 rounded-md " +
          (tabFocus === "equipment" ? "bg-white" : "bg-transparent")
        }
        onClick={() => {
          setTabFocus(() => "equipment");
        }}
      >
        Equipment
      </button>
      <button
        className={
          "m-1 py-0.5 rounded-md " +
          (tabFocus === "services" ? "bg-white" : "bg-transparent")
        }
        onClick={() => {
          setTabFocus(() => "services");
        }}
      >
        Services
      </button>
    </div>
  );
};

interface ItemInfo {
  id: number;
  name: string;
  cap: number | string;
  bswdEligible: boolean;
  csgdseEligible: boolean;
}
// Create equipment item / service item component
const Item = ({ itemInfo, type }: { itemInfo: ItemInfo; type: string }) => {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h4 className="font-semibold">{itemInfo.name}</h4>
        <p>
          <span>Cap: ${itemInfo.cap}</span>
          {type === "equipment" ? (
            <>
              <span className="px-2">&#124;</span>
              <span>
                Eligible:{" "}
                {getEligibility(itemInfo.bswdEligible, itemInfo.csgdseEligible)}
              </span>
            </>
          ) : (
            <div>
              Eligible:{" "}
              {getEligibility(itemInfo.bswdEligible, itemInfo.csgdseEligible)}
            </div>
          )}
        </p>
      </div>
      <button className="border rounded-md px-2 font-semibold text-sm h-10">
        Add {type === "equipment" ? "Item" : "Service"}
      </button>
    </div>
  );
};

// Helper Function
// Retrieve eligible string according to bswd and csg-dse status
function getEligibility(bswd: boolean, csgdse: boolean) {
  if (bswd && csgdse) {
    return "BSWD & CSG-DSE";
  } else if (bswd) {
    return "BSWD";
  } else if (csgdse) {
    return "CSG-DSE";
  } else {
    throw new Error("Both BSWD and CSG-DSE are not eligible");
  }
}
