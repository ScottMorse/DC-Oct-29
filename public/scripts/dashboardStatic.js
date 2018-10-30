const taskWraps = Array.from(document.querySelectorAll('.task-wrap'))
const tasks = document.getElementById('tasks')
const completedTitle = document.getElementById('completed-title')

taskWraps.forEach(task => {
    if(task.classList.contains('completed')){
        completedTitle.innerHTML = 'Completed Tasks:'
        task.children[2].firstElementChild.style.display = 'none'
        tasks.appendChild(task)
    }
    else if(task.classList.contains('High')){
        const priority  = task.firstElementChild.firstElementChild.firstElementChild
        priority.innerHTML = "High priority!"
        priority.style.display = "block"
        task.parentElement.insertBefore(task,task.parentElement.firstElementChild)
    }
})