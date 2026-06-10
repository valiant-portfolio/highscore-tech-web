import { PageHead } from '@/components/admin/AdminPage';
import { PortfolioForm } from '@/components/admin/PortfolioForm';

export default function NewPortfolioPage() {
  return (
    <>
      <PageHead
        title="New project"
        description="Add a fresh case study to the public portfolio."
        back={{ href: '/admin/portfolio', label: 'Back to portfolio' }}
      />
      <PortfolioForm />
    </>
  );
}
