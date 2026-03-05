/**
 * Step 5: ServiceAndEquip component
 *
 * Fifth step of the BSWD application form that allows student to request services and equipment.
 */

import { FormData } from "@/types/bswd";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { ItemDisplay } from "@/types/bswd";
import { getItemsWithSuggestion } from "@/lib/item-suggestion/itemSuggestion";

interface ServiceAndEquipProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function ServiceAndEquip({ formData, setFormData }: ServiceAndEquipProps) {
  const { t, isLoaded } = useTranslation();
  const [tabFocus, setTabFocus] = useState("equipment");

  if (!isLoaded) return null;

  const functionalLimitations = formData.functionalLimitations
    .filter((limit) => limit.checked)
    .map((limit) => limit.label.toLowerCase());

  const availableEquip: ItemDisplay[] = [
    {
      id: 1,
      name: t("serviceEquipment.items.equipment.computerLaptop"),
      cap: 3500,
      bswdEligible: true,
      csgdseEligible: true,
      suggestionTags: [
        "communication",
        "learning",
        "dexterity",
        "mobility",
        "vision",
        "hearing",
      ],
    },
    {
      id: 2,
      name: t("serviceEquipment.items.equipment.tablet"),
      cap: 800,
      bswdEligible: true,
      csgdseEligible: true,
      suggestionTags: [
        "learning",
        "communication",
        "dexterity",
        "mobility",
        "vision",
        "hearing",
      ],
    },
    {
      id: 3,
      name: t("serviceEquipment.items.equipment.screenReadingSoftware"),
      cap: 2600,
      bswdEligible: true,
      csgdseEligible: true,
      suggestionTags: ["vision", "learning", "cognitive", "dexterity"],
    },
  ];

  const availableServies: ItemDisplay[] = [
    {
      id: 1,
      name: t("serviceEquipment.items.services.noteTakingServices"),
      cap: t("serviceEquipment.items.servicesCaps.noteTakingServices"),
      bswdEligible: true,
      csgdseEligible: true,
      suggestionTags: ["learning", "attention/concentration", "dexterity"],
    },
    {
      id: 2,
      name: t("serviceEquipment.items.services.tutoringServices"),
      cap: t("serviceEquipment.items.servicesCaps.tutoringServices"),
      bswdEligible: true,
      csgdseEligible: true,
      suggestionTags: [
        "learning",
        "cognitive",
        "attention/concentration",
        "mental health",
        "dexterity",
        "communication",
      ],
    },
    {
      id: 3,
      name: t("serviceEquipment.items.services.addAdhdCoaching"),
      cap: t("serviceEquipment.items.servicesCaps.addAdhdCoaching"),
      bswdEligible: true,
      csgdseEligible: false,
      suggestionTags: [
        "learning",
        "cognitive",
        "attention/concentration",
        "mental health",
      ],
    },
  ];

  const equipmentWithSuggestion = getItemsWithSuggestion(
    functionalLimitations,
    availableEquip,
  );

  const servicesWithSuggestion = getItemsWithSuggestion(
    functionalLimitations,
    availableServies,
  );

  const handleAddAll = () => {
    const currentItems =
      tabFocus === "equipment" ? availableEquip : availableServies;
    const itemType = tabFocus === "equipment" ? "Equipment" : "Service";

    const existingItemsFromCategory = formData.requestedItems.filter(
      (item) => item.category === itemType,
    );

    const allItemsAlreadyAdded = currentItems.every((currentItem) =>
      existingItemsFromCategory.some(
        (existing) => existing.item === currentItem.name,
      ),
    );

    if (allItemsAlreadyAdded && existingItemsFromCategory.length > 0) return;

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

    setFormData((prev) => ({
      ...prev,
      requestedItems: [...prev.requestedItems, ...newItems],
    }));
  };

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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {t("serviceEquipment.sectionHeader")}
      </h2>

      {formData.requestedItems && formData.requestedItems.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-base text-green-800">
            <strong>{formData.requestedItems.length}</strong>{" "}
            {t("serviceEquipment.requestedCount.prefix")}
          </p>
        </div>
      )}

      <TabBar tabFocus={tabFocus} setTabFocus={setTabFocus} />

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

          {equipmentWithSuggestion.map((equip) => (
            <Item
              key={equip.id}
              itemInfo={equip}
              type="equipment"
              formData={formData}
              setFormData={setFormData}
            />
          ))}
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

          {servicesWithSuggestion.map((service) => (
            <Item
              key={service.id}
              itemInfo={service}
              type="services"
              formData={formData}
              setFormData={setFormData}
            />
          ))}
        </>
      )}
    </div>
  );
}

interface TabFocusProps {
  tabFocus: string;
  setTabFocus: (data: string) => void;
}

const TabBar = ({ tabFocus, setTabFocus }: TabFocusProps) => {
  const { t, isLoaded } = useTranslation();
  if (!isLoaded) return null;

  return (
    <div className="grid grid-cols-2 bg-gray-200 text-center rounded-md">
      <button
        className={
          "m-1 py-0.5 rounded-md " +
          (tabFocus === "equipment" ? "bg-white" : "bg-transparent")
        }
        onClick={() => setTabFocus("equipment")}
      >
        {t("serviceEquipment.tabs.equipment")}
      </button>
      <button
        className={
          "m-1 py-0.5 rounded-md " +
          (tabFocus === "services" ? "bg-white" : "bg-transparent")
        }
        onClick={() => setTabFocus("services")}
      >
        {t("serviceEquipment.tabs.services")}
      </button>
    </div>
  );
};

interface ItemProps {
  itemInfo: ItemDisplay;
  type: "equipment" | "services";
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

const Item = ({ itemInfo, type, formData, setFormData }: ItemProps) => {
  const { t, isLoaded, language } = useTranslation();
  const [hovered, setHovered] = useState(false);

  if (!isLoaded) return null;

  const itemType = type === "equipment" ? "Equipment" : "Service";

  const isAdded = formData.requestedItems.some(
    (item) => item.category === itemType && item.item === itemInfo.name,
  );

  const handleAddItem = () => {
    if (isAdded) {
      setFormData((prev) => ({
        ...prev,
        requestedItems: prev.requestedItems.filter(
          (item) =>
            !(item.category === itemType && item.item === itemInfo.name),
        ),
      }));
      return;
    }

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
  };

  const buildSearchUrl = (base: string, params: Record<string, string>) => {
    const qs = new URLSearchParams(params);
    return `${base}${base.includes("?") ? "&" : "?"}${qs.toString()}`;
  };

  const equipmentLinks = [
    {
      label: "Amazon.ca",
      href: buildSearchUrl("https://www.amazon.ca/s", { k: itemInfo.name }),
    },
    {
      label: "BestBuy.ca",
      href: buildSearchUrl("https://www.bestbuy.ca/en-ca/search", { search: itemInfo.name }),
    },
    {
      label: "Staples.ca",
      href: buildSearchUrl("https://www.staples.ca/search", { q: itemInfo.name }),
    },
  ];

  const serviceLinks = [
    {
      label: "EdVisingU",
      href: "https://edvisingu.com/",
    },
    {
      label: t("serviceEquipment.affiliate.osapContactsLabel"),
      href: "https://osap.gov.on.ca/OSAPPortal/en/Contacts/ProvinciallyfundedSchoolsinOntario/index.htm",
    },
    {
      label: "Ontario.ca",
      href: "https://www.ontario.ca/page/osap-for-under-represented-learners#section-3",
    },
  ];

  const links = type === "equipment" ? equipmentLinks : serviceLinks;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold">
            {itemInfo.name}{" "}
            {itemInfo.isSuggested && (
              <span className="rounded-full p-1 bg-yellow-500 ml-2">
                <i className="fa-solid fa-thumbs-up text-white"></i>
              </span>
            )}
          </h4>
          <p>
            <span>
              {t("serviceEquipment.labels.cap")}:{" "}
              {typeof itemInfo.cap === "number" ? `$${itemInfo.cap}` : itemInfo.cap}
            </span>
            <span className="px-2">&#124;</span>
            <span>
              {t("serviceEquipment.labels.eligible")}:{" "}
              {getEligibility(
                itemInfo.bswdEligible,
                itemInfo.csgdseEligible,
                t,
              )}
            </span>
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

      {isAdded && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-dark-blue/10 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-brand-dark-blue"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 7h12l-1 14H7L6 7Z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {t("serviceEquipment.affiliate.title")}
                </p>
                <p className="text-xs text-gray-500">
                  {t("serviceEquipment.affiliate.note")}
                </p>
              </div>
            </div>

            <a
              href={links[0]?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-dark-blue hover:underline"
            >
              {t("serviceEquipment.affiliate.openFirstOption")}
            </a>
          </div>

          <div className="border-t border-gray-100 px-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-white hover:border-brand-dark-blue/40 hover:text-brand-dark-blue transition"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <p className="mt-2 text-[11px] leading-4 text-gray-500">
              {t("serviceEquipment.affiliate.disclaimer")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

function getEligibility(
  bswd: boolean,
  csgdse: boolean,
  t: (key: string) => string,
) {
  if (bswd && csgdse) return t("serviceEquipment.eligibility.both");
  if (bswd) return t("serviceEquipment.eligibility.bswd");
  if (csgdse) return t("serviceEquipment.eligibility.csgdse");
  throw new Error("Both BSWD and CSG-DSE are not eligible");
}
