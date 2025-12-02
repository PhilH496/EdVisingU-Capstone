/**
 * FormNavigation component
 *
 * Provides Previous/Next navigation buttons for multi-step forms.
 *
 * Features:
 * - Disables "Previous" on the first step
 * - Shows "Submit Application" button on the last step instead of "Next"
 * - Disables "Next" button when required fields are incomplete
 * - Visual feedback with disabled states and different colors for each action
 *
 * @param currentStep - The step the user is currently on
 * @param totalSteps - Total number of steps in the form
 * @param onNext - Callback function when advancing forward
 * @param onPrevious - Callback function when going back
 * @param canProceed - Whether the current step's validation allows moving forward
 */

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  canProceed: boolean;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSubmit,
  canProceed,
}: FormNavigationProps) {
  // Check if we're on the first step (Previous button should be disabled)
  const isFirstStep = currentStep === 1;

  // Check if we're on the last step (show "Submit" instead of "Next")
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between pt-4 border-t">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={isFirstStep}
        className={`px-6 py-2 rounded-md ${
          isFirstStep
            ? // Disabled state: gray with no-click cursor
              "bg-gray-300 text-gray-500 cursor-not-allowed"
            : // Active state: light blue with hover effect06c
              "bg-brand-light-blue border border-brand-light-blue border text-brand-black hover:bg-[#b2c6de] hover:border-[#b2c6de]"
        }`}
      >
        Previous
      </button>

      {/* Conditional rendering: Show either "Next" or "Submit" button */}
      {!isLastStep ? (
        // Next Button (shown on all steps except the last)
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-md ${
            !canProceed
              ? // Disabled state: gray when validation fails
                "bg-gray-300 text-gray-500 cursor-not-allowed"
              : // Active state: blue with hover effect
                "bg-brand-dark-blue border border-brand-dark-blue text-white hover:bg-[#005580] hover:border-[#005580]"
          }`}
        >
          Next
        </button>
      ) : (
        // Submit Button (shown only on the final step)
        // Green color indicates final action
        // Note: This button is never disabled on the last step
        <button
          onClick={onSubmit}
          className="px-6 py-2 bg-brand-green text-brand-black border border-[#d0e6b8] rounded-md hover:bg-[#d0e6b8]"
        >
          Submit Application
        </button>
      )}
    </div>
  );
}
