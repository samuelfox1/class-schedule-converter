const scheduleInputEl = $('#schedule-input')
const clearInputBtn = $('#clear-input-btn')
const formEl = $('form')
const selectEl = $('select')
const inputContainerEl = $('#input-container')
const scheduleOutputEl = $('#schedule-output')
const copyOutputBtn = $('#copy-output-btn')
const docTitle = $('title')

const buildNewMatrix = (string) => {
    const arrayOfLines = string.split('\n')
    const sanitizeArray = arrayOfLines.map(line => line.trim()).filter(value => value !== '')
    const matrix = sanitizeArray.map(line => line.split('|'))
    return matrix
}

const convertStartTime = (string, config) => {
    const matrix = buildNewMatrix(string)
    let ampmStr = config.startingAmPm
    let trackStartingHour = parseInt(config.startingHour)

    // track the hour the schedule starts at
    let trackExistingHour = ''

    // track the minutes depending on activity Duration
    let trackStartingMinutes = parseInt(config.startingMinute)

    const updateScheduleTime = (currentTime) => {
        const hourString = `${trackStartingHour}`
        const minuteString = `${trackStartingMinutes}`
        currentTime[0] = hourString.length === 1 ? `0${trackStartingHour}` : trackStartingHour
        currentTime[1] = minuteString.length === 1 ? `0${trackStartingMinutes}` : trackStartingMinutes

        return ` ${currentTime.join(':')}${ampmStr} `
    }

    const toggleAmPm = () => ampmStr = ampmStr.toUpperCase() === 'AM' ? 'PM' : 'AM'
    const resetHourCount = () => trackStartingHour = 1
    const incrementHours = () => {
        trackExistingHour++
        trackStartingHour++
        trackStartingHour === 12 && toggleAmPm()
        trackStartingHour === 13 && resetHourCount()
    }
    const modifyDurationIfNeeded = (activity, duration) => {
        const formattedActivity = _.camelCase(activity)
        const timeAdjustment = parseInt(config.adjustTime[formattedActivity])
        return timeAdjustment
            ? formattedActivity === 'break'
                ? timeAdjustment
                : duration + timeAdjustment
            : duration
    }
    const setStartTimeForNextActivity = (duration) => {
        trackStartingMinutes = trackStartingMinutes + duration
        if (trackStartingMinutes >= 60) {
            incrementHours()
            trackStartingMinutes = trackStartingMinutes - 60
        }
    }
    const formatDuration = (duration) => {
        const numberToString = `${duration}`
        return numberToString.length > 1 ? numberToString : `0${numberToString}`
    }

    for (let i = 0; i < matrix.length; i++) {
        // target the array representing the current line in the schedule
        const currentLineArr = matrix[i]

        // target the Start time, remove white space and split the time bewteen hour & minute
        const currentLinesTimeArr = currentLineArr[1].trim().split(':')
        const linesExistingHour = currentLinesTimeArr[0]

        // skip the lines that arent time related
        const isAnHour = parseInt(linesExistingHour)
        if (!isAnHour) continue

        // save the existing number when it is found
        if (!trackExistingHour && isAnHour) trackExistingHour = isAnHour


        // target expected index position to modify time
        if (trackExistingHour && isAnHour) currentLineArr[1] = updateScheduleTime(currentLinesTimeArr)

        // target activity to determin duration and apply modifications if needed
        const activity = currentLineArr[3].trim().split(':')[0]

        // target the duration for this activity and check for updates
        const currentDuration = parseInt(currentLineArr[4].trim().split(':')[1])
        const updatedDuration = modifyDurationIfNeeded(activity, currentDuration)

        setStartTimeForNextActivity(updatedDuration)
        currentLineArr[4] = ` 0:${formatDuration(updatedDuration)}     `

        // re-assemble the line
        currentLineArr.join('|')

    }
    return matrix
}

const reassembleSchedule = (matrix) => {
    // adjust table formatting
    matrix[0][1] = ' Start   '
    matrix[1][1] = ' ------- '
    matrix[1][4] = ' -------  '
    const updated = matrix.map(arr => arr.join('|').trim())
    return updated.join('\n')
}
// console.log('input:\n', string)
// console.log('\n\noutput:\n', reassembleSchedule())

const handleNoInputError = (str) => {
    scheduleInputEl.val(str)
    scheduleOutputEl.text('')
}
const resetCopyButton = () => {
    copyOutputBtn.text('Copy')

}
const enableOutputElements = () => {
    scheduleOutputEl.removeAttr('disabled')
    copyOutputBtn.removeAttr('disabled')
}
const daySelected = (str) => (selectEl.val() === str) ? true : false

const handleConvertSchedule = (e) => {
    e.preventDefault()

    resetCopyButton()
    const inputString = scheduleInputEl.val().trim()
    if (!inputString) return handleNoInputError('paste class schedule here')

    const studentDoAdjustment = 5
    const instructorReviewAdjustment = 2
    const breakTime = (daySelected('saturday') ? 40 : 15)

    let hour = (daySelected('saturday')) ? 10 : 6
    let min = (daySelected('saturday')) ? 00 : 30
    let amPm = 'AM'
    if (hour >= 12) {
        amPm = 'PM'
        hour = (hour - 12 === 0) ? '12' : `${hour - 12}`
    }
    const config = {
        startingHour: +hour,
        startingMinute: +min,
        startingAmPm: amPm,
        adjustTime: {
            studentDo: studentDoAdjustment,
            instructorReview: instructorReviewAdjustment,
            break: breakTime
        }
    }

    const convertedMatrix = convertStartTime(inputString, config)
    enableOutputElements()
    scheduleOutputEl.text(reassembleSchedule(convertedMatrix))
}

const clearInputText = () => scheduleInputEl.val('')
const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(scheduleOutputEl.val().trim())
        copyOutputBtn.text('copied!')
    } catch (error) {
        console.error(error)
    }
}

inputContainerEl.on('click', () => $('label[for=schedule-input]').text('input:'))
formEl.on('submit', handleConvertSchedule)
clearInputBtn.click(clearInputText)
copyOutputBtn.click(copyToClipboard)

const init = () => {
    const exampleString = `
| Start  | #   | Activity Name                     | Duration |
| ------ | --- | --------------------------------- | -------- |
| 6:30PM | 1   | Instructor Do: Stoke Curiosity    | 0:10     |
| 6:40PM | 2   | Instructor Demo: HTML             | 0:05     |
| 6:45PM | 3   | Student Do: HTML                  | 0:15     |
| 7:00PM | 4   | Instructor Review: HTML           | 0:10     |
| 7:10PM | 5   | Instructor Demo: Attributes       | 0:05     |
| 7:15PM | 6   | Student Do: Attributes            | 0:15     |
| 7:30PM | 7   | Instructor Review: Attributes     | 0:10     |
| 7:40PM | 8   | Instructor Demo: Color            | 0:05     |
| 7:45PM | 9   | Student Do: Color                 | 0:15     |
| 8:00PM | 10  | BREAK                             | 0:15     |
| 8:15PM | 11  | Instructor Review: Color          | 0:10     |
| 8:25PM | 12  | Instructor Demo: Units and Font   | 0:05     |
| 8:30PM | 13  | Student Do: Units and Font        | 0:15     |
| 8:45PM | 14  | Instructor Review: Units and Font | 0:10     |
| 8:55PM | 15  | Instructor Demo: Selectors        | 0:05     |
| 9:00PM | 16  | Student Do: Selectors             | 0:15     |
| 9:15PM | 17  | Instructor Review: Selectors      | 0:15     |
| 9:30PM | 18  | END                               | 0:00     |
`

    scheduleInputEl.val(exampleString.trim())
    $('h1').text(docTitle.text())
}
init()