import { notFound } from 'next/navigation';
import { PageHead } from '@/components/admin/AdminPage';
import { CourseForm } from '@/components/admin/CourseForm';
import { getCourseAdmin } from '@/lib/admin/queries';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const course = await getCourseAdmin(id);
  if (!course) notFound();

  return (
    <>
      <PageHead
        title={course.title}
        description="Edit visible course content. Module breakdowns are managed through the seed file."
        back={{ href: '/admin/courses', label: 'Back to courses' }}
      />
      <CourseForm course={course} />
    </>
  );
}
