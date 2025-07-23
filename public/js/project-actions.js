// Project actions using event delegation
document.addEventListener('DOMContentLoaded', function() {
    // Listen for clicks on project action buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('project-action-btn')) {
            const button = e.target;
            const action = button.dataset.action;
            const projectId = button.dataset.projectId;
            
            if (action === 'apply') {
                handleApply(button, projectId);
            } else if (action === 'cancel') {
                handleCancel(button, projectId);
            }
        }
    });
});

function handleApply(button, projectId) {
    button.disabled = true;
    button.textContent = 'Applying...';
    button.style.backgroundColor = '#6c757d';

    fetch(`/client/projects/${projectId}/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update button to show "Cancel Application"
            button.textContent = 'Cancel Application';
            button.style.backgroundColor = '#dc3545';
            button.style.cursor = 'pointer';
            button.disabled = false;
            button.dataset.action = 'cancel';
        } else {
            // Show error and restore button
            button.disabled = false;
            button.textContent = 'Apply to Project';
            button.style.backgroundColor = 'rgb(1,97,97)';
            button.style.cursor = 'pointer';
        }
    })
    .catch(error => {
        console.error('Error applying to project:', error);
        button.disabled = false;
        button.textContent = 'Apply to Project';
        button.style.backgroundColor = 'rgb(1,97,97)';
        button.style.cursor = 'pointer';
    });
}

function handleCancel(button, projectId) {
    // Show confirmation alert first
    const confirmed = confirm('Are you sure you want to cancel this application? This action cannot be undone.');
    
    if (!confirmed) {
        return; // User cancelled the confirmation
    }
    
    button.disabled = true;
    button.textContent = 'Cancelling...';
    button.style.backgroundColor = '#6c757d';

    fetch(`/client/projects/${projectId}/cancel-application`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success alert
            alert('Application cancelled successfully!');
            
            // Find the project card and remove it from the applied projects list
            const projectCard = button.closest('.applied-project-card');
            if (projectCard) {
                projectCard.style.opacity = '0';
                projectCard.style.transform = 'translateX(-100%)';
                projectCard.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    projectCard.remove();
                    
                    // Check if there are no more applied projects
                    const appliedProjectsList = document.querySelector('.applied-projects-list');
                    if (appliedProjectsList && appliedProjectsList.children.length === 0) {
                        // Show "No projects found" message
                        const appliedProjectsSection = document.querySelector('.applied-projects-section');
                        if (appliedProjectsSection) {
                            appliedProjectsSection.innerHTML = `
                                <h2>Projects I've Applied To</h2>
                                <p>No projects found.</p>
                                <a href="/client/projects/public" class="btn" style="margin-bottom: 1em; display: inline-block; background-color: teal; color: white; padding: 0.5em 1em; text-decoration: none; border-radius: 0.3em;">Find Cool Projects</a>
                            `;
                        }
                    }
                }, 500);
            }
        } else {
            // Show error alert and restore button
            alert('Error cancelling application. Please try again.');
            button.disabled = false;
            button.textContent = 'Cancel Application';
            button.style.backgroundColor = '#dc3545';
            button.style.cursor = 'pointer';
        }
    })
    .catch(error => {
        console.error('Error cancelling application:', error);
        alert('Error cancelling application. Please try again.');
        button.disabled = false;
        button.textContent = 'Cancel Application';
        button.style.backgroundColor = '#dc3545';
        button.style.cursor = 'pointer';
    });
} 