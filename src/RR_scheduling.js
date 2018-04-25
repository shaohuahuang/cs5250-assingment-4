import {getAverageWaitingTime} from './util'

export function initProcessTasksMap(process_list) {
    return process_list.reduce((memo, process) => {
        if(!memo[process.id])
            memo[process.id] = []
        return memo
    },{})
}

export function RR_scheduling(process_list, time_quantum) {
    let schedule = []
    let current_time = 0
    let waiting_time = 0
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
        if(prevTurn != turn){
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


// export function RR_scheduling(process_list, time_quantum) {
//     let schedule = []
//     let current_time = 0
//     let process_list_copy = process_list.map(process => Object.assign({}, process))
//     let processTasksMap = initProcessTasksMap(process_list_copy)
//     let processedList = []
//
//     let readyQueue = Object.keys(processTasksMap)
//     let prevTurn = -1
//     while (readyQueue.length || process_list_copy.length){
//         if(readyQueue.length === 0){
//             // if no process in the readyQueue, advance current_time to the arrive time to the first remaining task
//             let firstTask = process_list_copy[0]
//             if(current_time < firstTask.arrive_time)
//                 current_time = firstTask.arrive_time
//             // readyQueue.push(firstTask.id) //add process into readyQueue
//         }
//         // if the tasks arrive_time smaller than current_time, put them in the task list of a process
//         while (process_list_copy.length){
//             if(process_list_copy[0].arrive_time <= current_time){
//                 let task = process_list_copy.shift()
//                 processTasksMap[task.id].push(task)
//                 let find = readyQueue.find(item => item === task.id)
//                 if(!find){ // if the process the task belongs to is not in the readyQuue
//                     readyQueue.push(task.id) //add process into readyQueue
//                 }
//             }else
//                 break // break the loop if the task's arrive time is larger than current_time
//         }
//
//         let turn = readyQueue.shift()
//         let taskList = processTasksMap[turn]
//         if(prevTurn !== turn){
//             schedule.push([current_time, turn])
//             prevTurn = turn
//         }
//         //execute the tasks on one process
//         let remaining_time = time_quantum //time slice remained for the process
//         while (remaining_time && taskList.length > 0){
//             let firstTask = taskList[0]
//             if(firstTask.remaining_burst_time > remaining_time){
//                 current_time += remaining_time // advance current_time
//                 firstTask.remaining_burst_time -= remaining_time //reduce remaining burst_time
//                 remaining_time = 0 //remaining_time used up
//                 readyQueue.push(turn) //put the process in the end of readyQueue
//             }else if(firstTask.remaining_burst_time === remaining_time){
//                 current_time += remaining_time // advance current_time
//                 firstTask.remaining_burst_time = 0
//                 firstTask.completion_time = current_time // set the completion_time
//                 processedList.push(taskList.shift()) //dequeue the task and queue them in processed list
//                 remaining_time = 0
//                 if(taskList.length !== 0) // if there is task, put the process in the readyQueue. Otherwise not
//                     readyQueue.push(turn)
//             }else{ // firstTask.remaining_burst_time < remaining_time
//                 current_time += firstTask.remaining_burst_time
//                 firstTask.remaining_burst_time = 0
//                 firstTask.completion_time = current_time
//                 processedList.push(taskList.shift())
//                 remaining_time -= firstTask.remaining_burst_time
//             }
//         }
//     }
//     // console.log(processedList)
//     return {RR_schedule: schedule, RR_avg_waiting_time: getAverageWaitingTime(processedList)}
// }