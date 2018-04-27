import fs from "fs"
import Heap from "heap"

function Process(id, arrive_time, burst_time){
    this.id = id
    this.arrive_time = arrive_time
    this.burst_time = burst_time
    this.remaining_burst_time = burst_time
}

//--------------------------------FCFS_scheduling---------------------------------------------------------------

function FCFS_scheduling(process_list) {
    let schedule = []
    let current_time = 0
    let waiting_time = 0
    process_list.forEach(process => {
        if(current_time < process.arrive_time)
            current_time = process.arrive_time
        schedule.push([current_time, process.id])
        waiting_time += current_time - process.arrive_time
        current_time = current_time + process.burst_time
    })
    let average_waiting_time = waiting_time / process_list.length
    return {FCFS_schedule: schedule, FCFS_avg_waiting_time: average_waiting_time}
}

//--------------------------------RR_scheduling---------------------------------------------------------------
function RR_scheduling(process_list, time_quantum) {
    let schedule = []
    let current_time = 0
    let process_list_copy = process_list.map(process => Object.assign({}, process))
    let processTasksMap = initProcessTasksMap(process_list_copy)
    let processedList = []

    let readyQueue = Object.keys(processTasksMap)
    let prevTurn = -1
    while (readyQueue.length || process_list_copy.length){
        if(readyQueue.length === 0){
            // if no process in the readyQueue, advance current_time to the arrive time to the first remaining task
            let firstTask = process_list_copy[0]
            if(current_time < firstTask.arrive_time)
                current_time = firstTask.arrive_time
        }
        // if the tasks arrive_time smaller than current_time, put them in the task list of a process
        while (process_list_copy.length){
            if(process_list_copy[0].arrive_time <= current_time){
                let task = process_list_copy.shift()
                processTasksMap[task.id].push(task)
                let find = readyQueue.find(item => item == task.id)
                if(!find){ // if the process the task belongs to is not in the readyQuue
                    readyQueue.push(task.id) //add process into readyQueue
                }
            }else
                break // break the loop if the task's arrive time is larger than current_time
        }

        let turn = readyQueue.shift()
        let taskList = processTasksMap[turn]
        if(prevTurn !== turn){
            schedule.push([current_time, turn])
            prevTurn = turn
        }
        //execute the tasks on one process
        let remaining_time = time_quantum //time slice remained for the process
        while (remaining_time && taskList.length > 0){
            let firstTask = taskList[0]
            if(firstTask.remaining_burst_time > remaining_time){
                current_time += remaining_time // advance current_time
                firstTask.remaining_burst_time -= remaining_time //reduce remaining burst_time
                remaining_time = 0 //remaining_time used up
                readyQueue.push(turn) //put the process in the end of readyQueue
            }else if(firstTask.remaining_burst_time === remaining_time){
                current_time += remaining_time // advance current_time
                firstTask.remaining_burst_time = 0
                firstTask.completion_time = current_time // set the completion_time
                processedList.push(taskList.shift()) //dequeue the task and queue them in processed list
                remaining_time = 0
                if(taskList.length !== 0) // if there is task, put the process in the readyQueue. Otherwise not
                    readyQueue.push(turn)
            }else{ // firstTask.remaining_burst_time < remaining_time
                current_time += firstTask.remaining_burst_time
                firstTask.remaining_burst_time = 0
                firstTask.completion_time = current_time
                processedList.push(taskList.shift())
                remaining_time -= firstTask.remaining_burst_time
            }
        }
    }
    // console.log(processedList)
    return {RR_schedule: schedule, RR_avg_waiting_time: getAverageWaitingTime(processedList)}
}

function initProcessTasksMap(process_list) {
    return process_list.reduce((memo, process) => {
        if(!memo[process.id])
            memo[process.id] = []
        return memo
    },{})
}

function getAverageWaitingTime(processedList) {
    let total = processedList.reduce((memo, task) => {
        return memo + task.completion_time - task.arrive_time - task.burst_time
    }, 0)
    return (total / processedList.length).toFixed(2)
}

//--------------------------------SRTF_scheduling----------------------------------------
function SRTF_scheduling(process_list){
    let schedule = []
    let current_time = 0
    let heap = new Heap((a, b) => a.remaining_burst_time - b.remaining_burst_time)
    let process_list_copy = process_list.map(process => Object.assign({}, process))
    let processedList = []
    let prevTurn = -1

    while (heap.size() > 0 || process_list_copy.length > 0){
        if(heap.size() === 0){
            //advance the time to the arrive_time of the first task if heap is empty
            let firstTask = process_list_copy[0]
            if(current_time < firstTask.arrive_time)
                current_time = firstTask.arrive_time
        }

        while (process_list_copy.length > 0){
            if(process_list_copy[0].arrive_time <= current_time){
                // add the task into min heap if its arrive_time smaller than current_time
                heap.push(process_list_copy.shift())
            }
            else
                break
        }

        //execute task
        let task = heap.pop();
        if(task.id !== prevTurn){
            schedule.push([current_time, task.id])
            prevTurn = task.id
        }
        if(process_list_copy.length > 0){
            let firstTask = process_list_copy[0]
            if(task.remaining_burst_time + current_time <= firstTask.arrive_time){
                // peacefully execute this task
                current_time += task.remaining_burst_time // advance current_time
                task.completion_time = current_time //set completion_time
                task.remaining_burst_time = 0 // set remaining_burst_time to 0
                processedList.push(task) // add the completed task into processed list
            }else{
                let execution_time = firstTask.arrive_time - current_time
                task.remaining_burst_time -= execution_time
                current_time = firstTask.arrive_time //set current_time to the arrive_time of first task
                heap.push(task)
                heap.push(process_list_copy.shift())
            }
        }else{
            // no task in process_list
            current_time += task.remaining_burst_time // advance current_time
            task.completion_time = current_time //set completion_time
            task.remaining_burst_time = 0 // set remaining_burst_time to 0
            processedList.push(task) // add the completed task into processed list
        }
    }

    console.log(processedList)
    return {SRTF_schedule: schedule, SRTF_avg_waiting_time: getAverageWaitingTime(processedList)}
}

//--------------------------------SJF_scheduling--------------------------------------
function SJF_scheduling(process_list, alpha) {
    let schedule = []
    let current_time = 0
    let process_list_copy = process_list.map(process => Object.assign({}, process))
    let processedList = []
    let processMeta = {
        0: {
            tau: 5,
            queue: []
        },
        1: {
            tau: 5,
            queue: []
        },
        2: {
            tau: 5,
            queue: []
        },
        3: {
            tau: 5,
            queue: []
        }
    }

    let prevTurn = -1
    let turn = -1
    while (turn !== -1 || process_list_copy.length !== 0){
        if(getTurn(processMeta) === -1) {
            if(process_list_copy.length){
                if( current_time < process_list_copy[0].arrive_time)
                    current_time = process_list_copy[0].arrive_time
            }
            else
                break
        }

        while (process_list_copy.length > 0){
            //push all tasks into the ready queue if their arrive_time is smaller than current_time
            if(process_list_copy[0].arrive_time <= current_time){
                let task = process_list_copy.shift()
                processMeta[task.id].queue.push(task)
            }else
                break
        }

        turn = getTurn(processMeta)
        if(turn !== prevTurn){
            prevTurn = turn
            schedule.push([current_time, turn])
        }

        let meta = processMeta[turn]
        let task = meta.queue.shift()
        current_time += task.burst_time
        task.completion_time = current_time
        meta.tau = alpha * meta.tau + (1 - alpha) * task.burst_time
        processedList.push(task)
    }

    // console.log(processedList)
    return {SJF_schedule: schedule, SJF_avg_waiting_time: getAverageWaitingTime(processedList)}
}

function getTurn(processMeta) {
    let turn = -1
    let tau = Number.MAX_SAFE_INTEGER
    Object.keys(processMeta).forEach(key => {
        let meta = processMeta[key]
        if(meta.queue.length !== 0){
            if(meta.tau < tau){
                turn = key
                tau = meta.tau
            }
        }
    })
    return turn
}

//---------------------------------------------------------------------------------

function read_input() {
    let lines = fs.readFileSync("input.txt").toString().split("\n")
    return lines.map(line => {
        let array = line.split(" ")
        console.log(array)
        return new Process(
            parseInt(array[0]),
            parseInt(array[1]),
            parseInt(array[2])
        )
    })
}

function write_output(file_name, schedule, avg_waiting_time) {
    let lines = schedule.map(item => {
        return item.toString()
    })
    lines.push(`average waiting time ${avg_waiting_time}`)
    fs.writeFileSync(file_name, lines.join("\n"))
}


function main(argv) {
    let process_list = read_input()
    console.log("printing input -----")
    process_list.forEach(process => console.log(process))

    console.log("simulating FCFS ----")
    let {FCFS_schedule, FCFS_avg_waiting_time} = FCFS_scheduling(process_list)
    write_output("FCFS.txt", FCFS_schedule, FCFS_avg_waiting_time)

    console.log("simulating RR ----")
    let time_quantum = 2
    let {RR_schedule, RR_avg_waiting_time} = RR_scheduling(process_list, time_quantum)
    write_output("RR.txt", RR_schedule, RR_avg_waiting_time)

    console.log("simulating SRTF ----")
    let {SRTF_schedule, SRTF_avg_waiting_time} = SRTF_scheduling(process_list)
    write_output("SRTF.txt", SRTF_schedule, SRTF_avg_waiting_time)

    console.log("simulating SJF ----")
    let alpha = 0.5
    let {SJF_schedule, SJF_avg_waiting_time} = SJF_scheduling(process_list, alpha)
    write_output("SJF.txt", SJF_schedule, SJF_avg_waiting_time)
}

main()


















