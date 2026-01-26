/**
 * Step 5: ServiceAndEquip component
 *
 * Fifth step of the BSWD application form that allows student to request services and equipment.
 */

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
    const currentItems =
      tabFocus === "equipment" ? availableEquip : availableServies;
    const itemType = tabFocus === "equipment" ? "Equipment" : "Service";

    // Check if items from this category already exist
    const existingItemsFromCategory = formData.requestedItems.filter(
      (item) => item.category === itemType
    );

    // Check if all items are already added
    const allItemsAlreadyAdded = currentItems.every((currentItem) =>
      existingItemsFromCategory.some(
        (existing) => existing.item === currentItem.name
      )
    );

    if (allItemsAlreadyAdded && existingItemsFromCategory.length > 0) {
      // All items already added for this category — nothing to do
      return;
    }

    // Create RequestedItem objects for items that don't exist yet
    const newItems = currentItems
      .filter(
        (item) =>
          !existingItemsFromCategory.some(
            (existing) => existing.item === item.name
          )
      )
      .map((item) => ({
        category: itemType,
        item: item.name,
        cost: typeof item.cap === 'number' ? item.cap : 0,
        justification: `${itemType} requested for disability support`,
        fundingSource: (item.bswdEligible && item.csgdseEligible) ? 'both' : 
                       (item.bswdEligible ? 'bswd' : 'csg-dse') as 'bswd' | 'csg-dse' | 'both'
      }));

    setFormData((prev) => {
      const updated = {
        ...prev,
        requestedItems: [...prev.requestedItems, ...newItems],
      };
      return updated;
    });
  };

  // Check if all items in current tab are added
  const areAllItemsAdded = () => {
    const currentItems =
      tabFocus === "equipment" ? availableEquip : availableServies;
    const itemType = tabFocus === "equipment" ? "Equipment" : "Service";
    const existingItemsFromCategory = formData.requestedItems.filter(
      (item) => item.category === itemType
    );

    return currentItems.every((currentItem) =>
      existingItemsFromCategory.some(
        (existing) => existing.item === currentItem.name
      )
    );
  };

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setTabFocus(newTab);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Section F: Services and Equipment
      </h2>

      {/* duplicate warning removed — condition is unreachable */}

      {/* Display current requested items count */}
      {formData.requestedItems && formData.requestedItems.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-base text-green-800">
            <strong>{formData.requestedItems.length}</strong> item(s) currently
            requested
          </p>
        </div>
      )}

      {/* 
        Display TabBar component based on focus status
        < Focusing on Equipment or Services > 
      */}
      {<TabBar tabFocus={tabFocus} setTabFocus={handleTabChange} />}
      {tabFocus === "equipment" ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Disability-Related Equipment
            </h3>
            <button
              onClick={handleAddAll}
              disabled={areAllItemsAdded()}
              className={`font-semibold px-4 py-2 rounded-md transition-colors ${
                areAllItemsAdded()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-brand-dark-blue hover:bg-brand-dark-blue/90 text-white"
              }`}
            >
              Add All Equipment
            </button>
          </div>
          {availableEquip.map((equip) => {
            return (
              <Item
                key={equip.id}
                itemInfo={equip}
                type={tabFocus}
                formData={formData}
                setFormData={setFormData}
              />
            );
          })}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Disability-Related Services
            </h3>
            <button
              onClick={handleAddAll}
              disabled={areAllItemsAdded()}
              className={`font-semibold px-4 py-2 rounded-md transition-colors ${
                areAllItemsAdded()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-brand-dark-blue hover:bg-brand-dark-blue/90 text-white"
              }`}
            >
              Add All Services
            </button>
          </div>
          {availableServies.map((equip) => {
            return (
              <Item
                key={equip.id}
                itemInfo={equip}
                type={tabFocus}
                formData={formData}
                setFormData={setFormData}
              />
            );
          })}
        </>
      )}
    </div>
  );
}

interface TabFocusProps {
  tabFocus: string;
  setTabFocus: (data: string) => void;
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
          setTabFocus("equipment");
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
          setTabFocus("services");
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

interface ItemProps {
  itemInfo: ItemInfo;
  type: string;
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

// Create equipment item / service item component
const Item = ({ itemInfo, type, formData, setFormData }: ItemProps) => {
  const itemType = type === "equipment" ? "Equipment" : "Service";

  // Check if this item is already added
  const isAdded = formData.requestedItems.some(
    (item) => item.category === itemType && item.item === itemInfo.name
  );

  // Hover state to change text to 'Remove Item' when hovering an already-added item
  const [hovered, setHovered] = useState(false);

  const handleAddItem = () => {
    if (isAdded) {
      // Remove item if already added
      setFormData((prev) => ({
        ...prev,
        requestedItems: prev.requestedItems.filter(
          (item) => !(item.category === itemType && item.item === itemInfo.name)
        ),
      }));
    } else {
      // Add new item
      const newItem = {
        category: itemType,
        item: itemInfo.name,
        cost: typeof itemInfo.cap === 'number' ? itemInfo.cap : 0,
        justification: `${itemType} requested for disability support`,
        fundingSource: (itemInfo.bswdEligible && itemInfo.csgdseEligible) ? 'both' : 
                       (itemInfo.bswdEligible ? 'bswd' : 'csg-dse') as 'bswd' | 'csg-dse' | 'both'
      };

      setFormData((prev) => ({
        ...prev,
        requestedItems: [...prev.requestedItems, newItem],
      }));
    }
  };

  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <div className="font-semibold">{itemInfo.name}</div>
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
      <button
        onClick={handleAddItem}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`border rounded-md px-2 font-semibold text-sm h-10 transition-colors ${
          isAdded
            ? "bg-green-100 text-green-700 border-green-400 hover:bg-red-100 hover:text-red-700 hover:border-red-400"
            : "bg-white hover:bg-teal-50 hover:border-teal-600 hover:text-teal-600"
        }`}
      >
        {isAdded
          ? hovered
            ? "Remove Item"
            : "Added ✓"
          : `Add ${type === "equipment" ? "Item" : "Service"}`}
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