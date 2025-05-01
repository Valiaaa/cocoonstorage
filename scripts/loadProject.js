function loadProjectData(filename) {
    console.log("🚀 loading project:", filename);
  
    fetch("../../archive/data.json")
      .then(response => response.json())
      .then(data => {
        const project = data.projects.find(p => p.filename === filename);
        if (!project) {
          console.error("❌ Project not found:", filename);
          return;
        }
  
        console.log("✅ Loaded project:", project.title);
  
        document.getElementById('project-title').textContent = project.title;
        document.getElementById('project-medium').textContent = project.medium || "N/A";
        document.getElementById('project-dimension').textContent = project.dimension || "N/A";
        document.getElementById('project-date').textContent = project.date || "N/A";
  
        if (project.collaborator) {
          document.getElementById('collaborator').textContent = project.collaborator;
        } else {
          document.getElementById('collaborator').style.display = "none";
        }
  
        document.getElementById('project-description').innerHTML = project.description || "";
      })
      .catch(err => console.error("❌ Error loading project data:", err));
  }