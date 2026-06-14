import AddNewButton from "@/features/dashboard/components/add-new-btn";
import AddRepo from "@/features/dashboard/components/add-repo";

import ProjectTable from "@/features/dashboard/components/project-table";
import { duplicateProjectById, editProjectById, getAllPlaygroundForUser,deleteProjectById} from "@/features/playground/actions";

import EmptyState from "@/components/ui/empty-state";




const Page = async () => {
  const playgrounds = (await getAllPlaygroundForUser()) ?? [];

  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      
      {/* Top buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepo />
      </div>

      {/* Content */}
      <div className="mt-10 flex flex-col justify-center items-center w-full">

        {
        playgrounds && playgrounds.length === 0 ? ( <EmptyState title = "No Playgrounds Found" description = "You have not created any playground yet" imageSrc = "/empty-state.svg" />) : (
          <ProjectTable
          // @ts-ignore
          //TODO: NEED TO UPDATE THE TYPES OF THE PLAYGROUND
            projects={playgrounds}
            onDeleteProject={deleteProjectById}
            onUpdateProject={editProjectById}
            onDuplicateProject={duplicateProjectById}
          />
        )}
      </div>
    </div>
  );
};

export default Page;