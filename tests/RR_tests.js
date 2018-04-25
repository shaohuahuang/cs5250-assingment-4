// import sinon from "sinon"
import assert from "assert"
import { initProcessTasksMap, RR_scheduling} from "../src/RR_scheduling"
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

    describe("test RR_scheduling", () => {
        it("test one task", () => {
            let input = [
                [0,0,9]
            ]
            let process_list = input.map(t => new Process(...t))
            let {RR_schedule, RR_avg_waiting_time} = RR_scheduling(process_list, 2)
            assert.deepEqual([[ 0, '0' ]], RR_schedule)
            assert.equal(0, RR_avg_waiting_time)
        })

        it("test two task", () => {
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

        it("test three task", () => {
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

        it("test all task", () => {
            let input = [
                [0,0,9],
                [1,1,8],
                [2,2,2],
                [3,5,2],
                [3,30,5],
                [1,31,2],
                [2,32,6],
                [0,38,8],
                [2,60,7],
                [0,62,2],
                [1,65,3],
                [3,66,8],
                [1,90,10],
                [0,95,10],
                [2,98,9],
                [3,99,8]
            ]
            let process_list = input.map(t => new Process(...t))
            let {RR_schedule, RR_avg_waiting_time} = RR_scheduling(process_list, 10)
            console.log(RR_schedule)
            assert.deepEqual([
                [ 0, '0' ],
                [ 9, '1' ],
                [ 17, '2' ],
                [ 19, '3' ],
                [ 35, 1 ],
                [ 37, 2 ],
                [ 43, 0 ],
                [ 60, 2 ],
                [ 67, 0 ],
                [ 69, 1 ],
                [ 72, 3 ],
                [ 90, 1 ],
                [ 100, 0 ],
                [ 110, 2 ],
                [ 119, 3 ]
            ], RR_schedule)
            assert.equal(6.44, RR_avg_waiting_time)
        })
    })
})
