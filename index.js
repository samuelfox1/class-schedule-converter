console.clear()
const string = `| Start  | #   | Activity Name                       | Duration |
| ------ | --- | ----------------------------------- | -------- |
| 6:30PM | 1   | Instructor Do: Stoke Curiosity      | 0:10     |
| 6:40PM | 2   | Instructor Demo: jQuery Elements    | 0:05     |
| 6:45PM | 3   | Student Do: jQuery Elements         | 0:15     |
| 7:00PM | 4   | Instructor Review: jQuery Elements  | 0:10     |
| 7:10PM | 5   | Instructor Demo: Click Events       | 0:05     |
| 7:15PM | 6   | Student Do: Click Events            | 0:15     |
| 7:30PM | 7   | Instructor Review: Click Events     | 0:10     |
| 7:40PM | 8   | Instructor Demo: Form Elements      | 0:05     |
| 7:45PM | 9   | Student Do: Form Elements           | 0:15     |
| 8:00PM | 10  | BREAK                               | 0:15     |
| 8:15PM | 11  | Instructor Review: Form Elements    | 0:10     |
| 8:25PM | 12  | Instructor Demo: DOM Traversal      | 0:05     |
| 8:30PM | 13  | Student Do: DOM Traversal           | 0:15     |
| 8:45PM | 14  | Instructor Review: DOM Traversal    | 0:10     |
| 8:55PM | 15  | Instructor Demo: Event Delegation   | 0:05     |
| 9:00PM | 16  | Student Do: Event Delegation        | 0:15     |
| 9:15PM | 17  | Instructor Review: Event Delegation | 0:15     |
| 9:30PM | 18  | END                                 | 0:00     |
`
const arrayOfLines = string.split('\n')

const sanitizeArray = arrayOfLines.map(line => line.trim()).filter(value => value !== '')

const matrix = sanitizeArray.map(line => line.split('|'))

const newMatrix = []

const convertStartTime = (hourStr, minuteStr, ampmStr) => {
    let trackNewHour = parseInt(hourStr)
    // track the hour the schedule starts at
    let trackExistingHour
    // track the minutes depending on activity Duration
    let trackMinutes = minuteStr

    const updateScheduleTime = (currentTime) => {
        const hourString = `${trackNewHour}`
        currentTime[0] = hourString.length === 1 ? `0${trackNewHour}` : trackNewHour
        currentTime[1] = trackMinutes
        return ` ${currentTime.join(':')}${ampmStr} `
    }

    const toggleAmPm = () => ampmStr = ampmStr === 'AM' ? 'PM' : 'AM'
    const resetHourCount = () => trackNewHour = 1

    const incrementHours = () => {
        trackExistingHour++
        trackNewHour++

        trackNewHour === 12 && toggleAmPm()
        trackNewHour === 13 && resetHourCount()
    }


    for (let i = 0; i < matrix.length; i++) {
        // target the array representing the current line in the schedule
        const currentLineArr = matrix[i]
        // console.log(currentLineArr)

        // remove white space and split the time bewteen hour & minute
        const currentLinesTimeArr = currentLineArr[1].trim().split(':')
        const currentLinesDurationArr = currentLineArr[4].trim().split(':')
        console.log(currentLinesDurationArr)
        const linesExistingHour = currentLinesTimeArr[0]

        // find the existing start time and store it
        const isANumber = parseInt(linesExistingHour)
        if (!trackExistingHour && isANumber) trackExistingHour = isANumber

        // handle updating the tracked hour & converting the schedle hour
        if (trackExistingHour && isANumber) {
            if (trackExistingHour != isANumber) incrementHours()
            // target expected index position to modify time
            currentLineArr[1] = updateScheduleTime(currentLinesTimeArr)
        }

        //handle 


        // re-assemble the line
        currentLineArr.join('|')


    }

}

convertStartTime('10', '00', 'AM')
const updated = matrix.map(arr => arr.join('|'))
console.log(string)
console.log('\n\n', updated.join('\n'))