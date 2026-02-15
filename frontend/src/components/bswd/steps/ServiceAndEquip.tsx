/**
 * Step 5: ServiceAndEquip component
 *
 * Fifth step of the BSWD application form that allows student to request services and equipment.
 */

import { FormData } from "@/types/bswd";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n"; // translation import

interface ServiceAndEquipProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

// Main component
export function ServiceAndEquip({
  formData,
  setFormData,
}: ServiceAndEquipProps) {
  const { t, isLoaded } = useTranslation(); // translation handling

  const [tabFocus, setTabFocus] = useState("equipment");

  if (!isLoaded) return null;

  // Database mock up
  const availableEquip = [
    {
      id: 1,
      name: t("serviceEquipment.items.equipment.computerLaptop"),
      cap: 3500,
      bswdEligible: true,
      csgdseEligible: true,
    },
    {
      id: 2,
      name: t("serviceEquipment.items.equipment.tablet"),
      cap: 800,
      bswdEligible: true,
      csgdseEligible: true,
    },
    {
      id: 3,
      name: t("serviceEquipment.items.equipment.screenReadingSoftware"),
      cap: 2600,
      bswdEligible: true,
      csgdseEligible: true,
    },
  ];

  // Database mock up
  const availableServies = [
    {
      id: 1,
      name: t("serviceEquipment.items.services.noteTakingServices"),
      cap: t("serviceEquipment.items.servicesCaps.noteTakingServices"),
      bswdEligible: true,
      csgdseEligible: true,
    },
    {
      id: 2,
      name: t("serviceEquipment.items.services.tutoringServices"),
      cap: t("serviceEquipment.items.servicesCaps.tutoringServices"),
      bswdEligible: true,
      csgdseEligible: true,
    },
    {
      id: 3,
      name: t("serviceEquipment.items.services.addAdhdCoaching"),
      cap: t("serviceEquipment.items.servicesCaps.addAdhdCoaching"),
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
      (item) => item.category === itemType,
    );

    // Check if all items are already added
    const allItemsAlreadyAdded = currentItems.every((currentItem) =>
      existingItemsFromCategory.some(
        (existing) => existing.item === currentItem.name,
      ),
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
            (existing) => existing.item === item.name,
          ),
      )
      .map((item) => ({
        category: itemType,
        item: item.name,
        cost: typeof item.cap === "number" ? item.cap : 0,
        justification: `${itemType} requested for disability support`,
        fundingSource:
          item.bswdEligible && item.csgdseEligible
            ? "both"
            : ((item.bswdEligible ? "bswd" : "csg-dse") as
                | "bswd"
                | "csg-dse"
                | "both"),
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
      (item) => item.category === itemType,
    );

    return currentItems.every((currentItem) =>
      existingItemsFromCategory.some(
        (existing) => existing.item === currentItem.name,
      ),
    );
  };

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setTabFocus(newTab);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {t("serviceEquipment.sectionHeader")}
      </h2>

      {/* duplicate warning removed — condition is unreachable */}

      {/* Display current requested items count */}
      {formData.requestedItems && formData.requestedItems.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-base text-green-800">
            <strong>{formData.requestedItems.length}</strong>{" "}
            {t("serviceEquipment.requestedCount.prefix")}
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
            <h2 className="text-lg font-semibold">
              {t("serviceEquipment.equipmentHeader")}
            </h2>
            <button
              onClick={handleAddAll}
              disabled={areAllItemsAdded()}
              className={`font-semibold px-4 py-2 rounded-md transition-colors ${
                areAllItemsAdded()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-brand-dark-blue hover:bg-brand-dark-blue/90 text-white"
              }`}
            >
              {t("serviceEquipment.buttons.addAllEquipment")}
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
            <h2 className="text-lg font-semibold">
              {t("serviceEquipment.servicesHeader")}
            </h2>
            <button
              onClick={handleAddAll}
              disabled={areAllItemsAdded()}
              className={`font-semibold px-4 py-2 rounded-md transition-colors ${
                areAllItemsAdded()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-brand-dark-blue hover:bg-brand-dark-blue/90 text-white"
              }`}
            >
              {t("serviceEquipment.buttons.addAllServices")}
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
  const { t, isLoaded } = useTranslation(); // translation handling
  if (!isLoaded) return null;

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
        {t("serviceEquipment.tabs.equipment")}
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
        {t("serviceEquipment.tabs.services")}
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
  const { t, isLoaded } = useTranslation(); // translation handling

  // Hover state to change text to 'Remove Item' when hovering an already-added item
  const [hovered, setHovered] = useState(false);

  if (!isLoaded) return null;

  const itemType = type === "equipment" ? "Equipment" : "Service";

  // Check if this item is already added
  const isAdded = formData.requestedItems.some(
    (item) => item.category === itemType && item.item === itemInfo.name,
  );

  const handleAddItem = () => {
    if (isAdded) {
      // Remove item if already added
      setFormData((prev) => ({
        ...prev,
        requestedItems: prev.requestedItems.filter(
          (item) =>
            !(item.category === itemType && item.item === itemInfo.name),
        ),
      }));
    } else {
      // Add new item
      const newItem = {
        category: itemType,
        item: itemInfo.name,
        cost: typeof itemInfo.cap === "number" ? itemInfo.cap : 0,
        justification:
          itemType === "Equipment"
            ? t("serviceEquipment.justification.equipment")
            : t("serviceEquipment.justification.service"),
        fundingSource:
          itemInfo.bswdEligible && itemInfo.csgdseEligible
            ? "both"
            : ((itemInfo.bswdEligible ? "bswd" : "csg-dse") as
                | "bswd"
                | "csg-dse"
                | "both"),
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
        <h4 className="font-semibold">{itemInfo.name}</h4>
        <p>
          <span>
            {t("serviceEquipment.labels.cap")}: ${itemInfo.cap}
          </span>
          {type === "equipment" ? (
            <>
              <span className="px-2">&#124;</span>
              <span>
                {t("serviceEquipment.labels.eligible")}:{" "}
                {getEligibility(
                  itemInfo.bswdEligible,
                  itemInfo.csgdseEligible,
                  t,
                )}
              </span>
            </>
          ) : (
            <div>
              {t("serviceEquipment.labels.eligible")}:{" "}
              {getEligibility(
                itemInfo.bswdEligible,
                itemInfo.csgdseEligible,
                t,
              )}
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
            ? t("serviceEquipment.buttons.removeItem")
            : t("serviceEquipment.buttons.added")
          : type === "equipment"
            ? t("serviceEquipment.buttons.addItem")
            : t("serviceEquipment.buttons.addService")}
      </button>
    </div>
  );
};

// Helper Function
// Retrieve eligible string according to bswd and csg-dse status
function getEligibility(
  bswd: boolean,
  csgdse: boolean,
  t: (key: string) => string,
) {
  if (bswd && csgdse) {
    return t("serviceEquipment.eligibility.both");
  } else if (bswd) {
    return t("serviceEquipment.eligibility.bswd");
  } else if (csgdse) {
    return t("serviceEquipment.eligibility.csgdse");
  } else {
    throw new Error("Both BSWD and CSG-DSE are not eligible");
  }
}
