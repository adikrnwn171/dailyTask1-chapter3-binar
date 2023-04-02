// import atau panggil package yang kita mau pake di aplikasi kita
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());

// proses baca file json nya dengan FS module, dan json nya dibantu dibaca dengan JSON.parse
const persons = JSON.parse(fs.readFileSync(`${__dirname}/person.json`));

// url utama dari aplikasi
// req = request
// res = response
app.get('/', (req, res) => {
    res.send('Halo FSW 3 dari server nih');
})

app.post('/', (req, res) => {
    res.send('Kita bisa ngelakuin Post di url ini')
})

app.get('/person', (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            persons: persons
        }
    })
})

// get person by id (data satuan)
// :id url parameter
app.get('/person/:id', (req, res) => {
    const id = req.params.id * 1;
    const person = persons.find(el => el.id === id);

    if (!person) {
        res.status(400).json({
            status: 'failed',
            message: `person dengan id ${id} invalid`
        })
        return false
    }

    res.status(200).json({
        status: 'success',
        data: {
            person
        }
    })
})

// HTTP Method PUT = edit existing data
app.put('/person/:id', (req, res) => {
    const id = req.params.id * 1;
    const index = persons.findIndex(element => element.id === id);
    const person = persons.find(el => el.id === id);
    const personName = persons.findIndex(el => el.name === req.body.name);
    const checkData = (req.body.age && req.body.eyeColor && req.body.name ? true : false)
    const cukupUmur = parseInt(req.body.age) > 17;

    const data = {
        "id": id,
        "age": req.body.age,
        "eyeColor": req.body.eyeColor,
        "name": req.body.name
    }

    // validation
    if (!person) {
        res.status(400).json({
            status: 'failed',
            message: `person dengan id ${id} invalid`
        })
        return false
    } else if (!checkData) {
        res.status(400).json({
            status: 'failed',
            message: 'Data belum lengkap, silakan lengkapi data Anda'
        })
        return false
    } else if (personName !== -1 && personName !== index) {
        res.status(400).json({
            status: 'failed',
            message: `name ${req.body.name} already exist`
        })
        return false
    } else if (!cukupUmur) {
        res.status(400).json({
            status: 'failed',
            message: `Umur ${req.body.age} belum cukup, minimal 18 tahun`
        })
        return false
    }
    // edit data with splice
    persons.splice(person, 1, data);

    fs.writeFile(
        `${__dirname}/person.json`,
        JSON.stringify(persons),
        er => {
            res.status(200).json({
                status: 'success',
                message: `data dari id ${id} nya berhasil berubah`,
                dataAwal: person,
                dataAkhir: data
            })
        }
    )
})

// HTTP Method DELETE = delete existing data
app.delete('/person/:id', (req, res) => {
    const id = req.params.id * 1;

    const index = persons.findIndex(element => element.id === id);
    const person = persons.find(el => el.id === id);

    if (!person) {
        res.status(400).json({
            status: 'failed',
            message: `person dengan id ${id} invalid`
        })
    }

    if (index !== -1) {
        persons.splice(index, 1);
    }

    fs.writeFile(
        `${__dirname}/person.json`,
        JSON.stringify(persons),
        er => {
            res.status(200).json({
                status: 'success',
                message: `data dari id ${id} berhasil dihapus`
            })
        }
    )
})

app.post('/person', (req, res) => {

    console.log(persons.length - 1);
    const newId = persons.length + 1;
    const newPerson = Object.assign({ id: newId }, req.body)

    // validasi kalau name nya udah ada, maka gabisa create data baru
    const personName = persons.find(el => el.name === req.body.name);
    console.log(personName);
    const checkData = (req.body.age && req.body.eyeColor && req.body.name ? true : false)

    const cukupUmur = req.body.age < 20;

    if (personName) {
        res.status(400).json({
            status: 'failed',
            message: `name ${req.body.name} already exist`
        })
    } else if (cukupUmur) {
        res.status(400).json({
            status: 'failed',
            message: `umur ${req.body.age} belum cukup`
        })
    } else if (!checkData) {
        res.status(400).json({
            status: 'failed',
            message: 'Data belum lengkap, silakan lengkapi data Anda'
        })
    } else if (req.body.eyeColor !== 'green' || req.body.eyeColor !== 'blue') {
        res.status(400).json({
            status: 'failed',
            message: 'Eyecolor tidak bisa selain green atau blue'
        })
    }
    else {
        persons.push(newPerson);
        fs.writeFile(
            `${__dirname}/person.json`,
            JSON.stringify(persons),
            err => {
                res.status(201).json({
                    status: 'success',
                    data: {
                        person: newPerson
                    }
                })
            }
        )
    }
})

// memulai server
app.listen(PORT, () => {
    console.log(`App running on Localhost : ${PORT}`);
})