/**
 * FormNavigation Component
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
  canProceed: boolean;
}

export function FormNavigation({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious, 
  canProceed 
}: FormNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between pt-4 border-t">
      <button
        onClick={onPrevious}
        disabled={isFirstStep}
        className={`px-6 py-2 rounded-md ${
          isFirstStep
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        Previous
      </button>
      
      {!isLastStep ? (
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-md ${
            !canProceed
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Submit Application
        </button>
      )}
    </div>
  );
}