const { google } = require("googleapis")

const prompt = require("prompt-sync")({ sigint: true })

const getSheetsAuth = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    })

    const client = await auth.getClient()

    const googleSheets = google.sheets({
        version: "v4",
        auth: client,
    })

    const spreadsheetId = "13dNqgwuSU2bk-IJ2y0yxZcGA9uHJSdoQ1e2Er_0YMlM"

    return {
        auth,
        client,
        googleSheets,
        spreadsheetId,
    }
}

const getRows = async () => {
    const { auth, googleSheets, spreadsheetId } = await getSheetsAuth()

    const rows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Página1",
    })

    return rows
}

const searchEvent = async search => {
    getRows().then(res => {
        const rowTitles = res.data.values[0]

        const eventNameColumns = rowTitles.reduce((acc, title, index) => {
            const lowerCaseTitle = title.toLowerCase()

            if (lowerCaseTitle.includes("nome do evento")) {
                acc.push(index)
            }

            return acc
        }, [])

        let eventNameCounter = 0
        let eventName = search

        for (let rowIndex = 1; rowIndex < res.data.values.length; rowIndex++) {
            const row = res.data.values[rowIndex]

            if (!row.length) continue

            for (let i = 0; i < eventNameColumns.length; i++) {
                if (row.length < eventNameColumns[i]) continue

                const title = row[eventNameColumns[i]]

                if (title.toLowerCase().includes(eventName.toLocaleLowerCase())) {
                    if (eventNameCounter === 0) eventName = title
                    eventNameCounter++
                }
            }
        }

        console.log("")
        if (eventNameCounter === 0) {
            console.log("Não encontrado")
        } else {
            console.log("Nome:", eventName)
            console.log("Quantidade:", eventNameCounter)
        }
    })
}

const searchName = async search => {
    getRows().then(res => {
        const rowTitles = res.data.values[0]

        const attendeesNameColumns = rowTitles.reduce((acc, title, index) => {
            const lowerCaseTitle = title.toLowerCase()

            if (lowerCaseTitle.includes("nome")) {
                acc.push(index)
            }

            return acc
        }, [])

        let attendeeNameCounter = 0
        let attendeeName = search

        for (let rowIndex = 1; rowIndex < res.data.values.length; rowIndex++) {
            const row = res.data.values[rowIndex]

            if (!row.length) continue

            for (let i = 0; i < attendeesNameColumns.length; i++) {
                if (row.length < attendeesNameColumns[i]) continue

                const title = row[attendeesNameColumns[i]]

                if (!title) continue

                if (title.toLowerCase().includes(attendeeName.toLocaleLowerCase())) {
                    if (attendeeNameCounter === 0) attendeeName = title
                    attendeeNameCounter++
                }
            }
        }

        console.log("")
        if (attendeeNameCounter === 0) {
            console.log("Não encontrado")
        } else {
            console.log("Nome:", attendeeName)
            console.log("Quantidade:", attendeeNameCounter)
        }
    })
}

console.log("Digite 1 para saber o número de inscritos em um evento")
console.log("Digite 2 para saber o número de inscrições por nome")
console.log("")

const choice = prompt("")
console.log("")

switch (choice) {
    case "1":
        const event = prompt("Qual evento deseja buscar? ")

        console.log(event)
        searchEvent(event)
        break

    case "2":
        const name = prompt("Qual nome deseja buscar? ")

        console.log(name)
        searchName(name)
        break

    default:
        break
}
