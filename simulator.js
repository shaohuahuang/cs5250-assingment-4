import fs from "fs"

function Process(id, arrive_time, burst_time){
    this.id = id
    this.arrive_time = arrive_time
    this.burst_time = burst_time
}

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
    let {FCFS_schedule, FCFS_avg_waiting_time} = FCFS_scheduling(process_list)
    write_output("FCFS.txt", FCFS_schedule, FCFS_avg_waiting_time)
}

main()


















