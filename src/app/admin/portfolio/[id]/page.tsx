import { notFound } from 'next/navigation';
import { PageHead } from '@/components/admin/AdminPage';
import { PortfolioForm } from '@/components/admin/PortfolioForm';
import { getPortfolioAdmin } from '@/lib/admin/queries';
import { getCurrentUser } from '@/lib/auth/queries';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPortfolioPage({ params }: Props) {
  const { id } = await params;
  const [project, user] = await Promise.all([getPortfolioAdmin(id), getCurrentUser()]);
  if (!project) notFound();

  return (
    <>
      <PageHead
        title={project.title}
        description="Edit case study copy, swap the cover image, or unpublish."
        back={{ href: '/admin/portfolio', label: 'Back to portfolio' }}
      />
      <PortfolioForm project={project} canDelete={user?.role === 'admin'} />
    </>
  );
}
