// Confirmation/Receipt Page
import { useRouter } from 'next/router';
import { FormLayout } from '@/components/bswd/FormLayout';

export default function Confirmation() {
  const router = useRouter();
  const { applicationId } = router.query;
  return (
    <FormLayout
      title="Application Submitted!"
      description="Your BSWD/CSG-DSE application has been successfully submitted"
    >
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
        <p className="text-gray-600 mb-4">
          Your application has been saved to the database.
        </p>
        {applicationId && (
          <p className="text-sm text-gray-500 mb-4">
            Application ID: {applicationId}
          </p>
        )}
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-brand-dark-blue text-white rounded-md hover:bg-[#005580]"
        >
          Submit Another Application
        </button>
      </div>
    </FormLayout>
  );
}