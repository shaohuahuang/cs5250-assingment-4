// import sinon from "sinon"
import assert from "assert"
import {isEmpty, initProcessTasksMap, getAverageWaitingTime, RR_scheduling} from "../src/RR_scheduling"
import Process from "../src/Process"

describe("test RR_scheduling", () => {
    it("test initProcessTasksMap", () => {
        let input = [
            [0,0,9],
            [1,1,8],
            [2,2,2],
            [3,5,2],
            [3,30,5],
            [1,31,2],
            [2,32,6]
        ]

        let process_list = input.map(t => new Process(...t))
        // console.log(initProcessTasksMap(process_list))
        assert.deepEqual({ '0': [],
                '1': [ ],
                '2':[ ],
                '3': [ ] }

            , initProcessTasksMap(process_list))
    })

    it("test getAverageWaitingTime", () => {
        let processedList = [
            { id: 0, arrive_time: 0, burst_time: 9, completion_time: 19 },
            { id: 0, arrive_time: 0, burst_time: 10, completion_time: 20 },
            { id: 0, arrive_time: 0, burst_time: 11, completion_time: 21 },
            { id: 0, arrive_time: 0, burst_time: 12, completion_time: 22 },
        ]
        assert.equal(10.00, getAverageWaitingTime(processedList))
    })

    describe("test RR_scheduling", () => {
        it("test one task", () => {
            let input = [
                [0,0,9]
            ]
            let process_list = input.map(t => new Process(...t))
            let {RR_schedule, RR_avg_waiting_time} = RR_scheduling(process_list, 2)
            assert.deepEqual([[ 0, '0' ], [ 2, '0' ], [ 4, '0' ], [ 6, '0' ], [ 8, '0' ]], RR_schedule)
            assert.equal(0, RR_avg_waiting_time)
        })

        it("test one task", () => {
            let input = [
                [0,0,9],
                [1,1,8]
            ]
            let process_list = input.map(t => new Process(...t))
            let {RR_schedule, RR_avg_waiting_time} = RR_scheduling(process_list, 2)
            assert.deepEqual([
                [ 0, '0' ],
                [ 2, '1' ],
                [ 4, '0' ],
                [ 6, '1' ],
                [ 8, '0' ],
                [ 10, '1' ],
                [ 12, '0' ],
                [ 14, '1' ],
                [ 16, '0' ]
            ], RR_schedule)
            assert.equal(7.5, RR_avg_waiting_time)
        })

        it("test one task", () => {
            let input = [
                [0,0,9],
                [1,1,8],
                [2,2,2]
            ]
            let process_list = input.map(t => new Process(...t))
            let {RR_schedule, RR_avg_waiting_time} = RR_scheduling(process_list, 2)
            assert.deepEqual([
                [ 0, '0' ],
                [ 2, '1' ],
                [ 4, '2' ],
                [ 6, '0' ],
                [ 8, '1' ],
                [ 10, '0' ],
                [ 12, '1' ],
                [ 14, '0' ],
                [ 16, '1' ],
                [ 18, '0']
            ], RR_schedule)
            assert.equal(7.00, RR_avg_waiting_time)
        })

        it("test one task", () => {
            let input = [
                [0,0,9],
                [1,1,8],
                [2,2,2]
            ]
            let process_list = input.map(t => new Process(...t))
            let {RR_schedule, RR_avg_waiting_time} = RR_scheduling(process_list, 7)
            assert.deepEqual([ [ 0, '0' ], [ 7, '1' ], [ 14, '2' ], [ 16, '0' ], [ 18, '1' ] ], RR_schedule)
            assert.equal(10.33, RR_avg_waiting_time)
        })
    })
})
