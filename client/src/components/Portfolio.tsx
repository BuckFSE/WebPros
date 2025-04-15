import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogClose, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { projects, projectCategories } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredProjects = activeFilter === "all"
    ? projects
    : projects.filter(project => project.category === activeFilter);

  const openProjectDialog = (project: typeof projects[0]) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Our Work</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">Featured Projects</h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-4 mb-6 rounded-full"></div>
          <p className="max-w-2xl mx-auto text-gray-600">
            Explore our latest work showcasing the depth and breadth of our capabilities.
          </p>
        </div>
        
        {/* Projects Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredProjects.map((project, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="group cursor-pointer"
              onClick={() => openProjectDialog(project)}
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg h-64">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                <div 
                  className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${project.imageUrl})` }}
                ></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="bg-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                  <h3 className="text-white text-xl font-bold mt-2">{project.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{project.technologies}</p>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:bg-opacity-30">
                  <span className="text-white font-medium px-4 py-2 rounded-lg bg-primary/90">
                    View Project
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="text-center mt-12">
          <Button className="bg-primary hover:bg-blue-600 text-white">
            View All Projects
          </Button>
        </div>
      </div>

      {/* Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedProject && (
          <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl">
            <div className="sr-only">
              <DialogTitle>{selectedProject.title}</DialogTitle>
              <DialogDescription>
                {`Detailed view of ${selectedProject.title} project built with ${selectedProject.technologies}`}
              </DialogDescription>
            </div>
            
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <div className="relative w-full h-[70vh] md:h-[80vh]">
                  <img 
                    src={selectedProject.imageUrl} 
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <span className="bg-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {projectCategories.find(cat => cat.id === selectedProject.category)?.name || "Project"}
                  </span>
                  <h3 className="text-white text-2xl font-bold mt-2">{selectedProject.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{selectedProject.technologies}</p>
                </div>
                <DialogClose className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white">
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </motion.div>
            </AnimatePresence>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
