import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://ijucmofkmpkzqnogzvcl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqdWNtb2ZrbXBrenFub2d6dmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxOTYxMTIsImV4cCI6MjA5MDc3MjExMn0.y6LkfViQzQyQ3BSnkIK0lAQOiiTg62luKbysaP-xn0c'
)

let editId = null

// ================= LOGIN =================
window.login = async function () {
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert("Login gagal ❌")
  } else {
    alert("Login berjaya 😎")
    await checkUser()
    await loadData()
  }
}

// ================= LOGOUT =================
window.logout = async function () {
  await supabase.auth.signOut()
  location.reload()
}

// ================= CHECK USER =================
async function checkUser() {
  const { data } = await supabase.auth.getUser()

  if (data.user) {
    document.getElementById("loginBox").style.display = "none"
    document.getElementById("mainApp").style.display = "block"
  } else {
    document.getElementById("loginBox").style.display = "block"
    document.getElementById("mainApp").style.display = "none"
  }
}

// ================= INSERT / UPDATE =================
window.hantar = async function () {

  const nama = document.getElementById("name").value
  const kelas = document.getElementById("class").value
  const program = document.getElementById("program").value

  if (!nama || !kelas || !program) {
    alert("Sila isi semua field ⚠️")
    return
  }

  if (editId) {
    const { error } = await supabase
      .from('pajsk_records')
      .update({
        student_name: nama,
        class_name: kelas,
        program_name: program
      })
      .eq('id', editId)

    if (error) {
      alert("Gagal update ❌")
      return
    }

    editId = null
    alert("Data berjaya update ✏️")

  } else {
    const { error } = await supabase
      .from('pajsk_records')
      .insert([{
        student_name: nama,
        class_name: kelas,
        program_name: program
      }])

    if (error) {
      alert("Gagal simpan ❌")
      return
    }

    alert("Data berjaya disimpan ✅")
  }

  clearInput()
  loadData()
}

// ================= LOAD DATA =================
window.loadData = async function () {

  const keyword = document.getElementById("search").value.toLowerCase() || ""

  const { data, error } = await supabase
    .from('pajsk_records')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error(error)
    alert("Error ambil data ❌")
    return
  }

  let html = ""

  data
    .filter(item => item.student_name.toLowerCase().includes(keyword))
    .forEach(item => {
      html += `
        <tr>
          <td>${item.student_name}</td>
          <td>${item.class_name}</td>
          <td>${item.program_name}</td>
          <td>
            <button onclick="editData('${item.id}','${item.student_name}','${item.class_name}','${item.program_name}')">✏️</button>
            <button class="delete" onclick="padam('${item.id}')">Delete</button>
          </td>
        </tr>
      `
    })

  document.getElementById("senarai").innerHTML =
    html || `<tr><td colspan="4">📭 Tiada rekod dijumpai</td></tr>`
}

// ================= EDIT =================
window.editData = function(id, nama, kelas, program) {
  document.getElementById("name").value = nama
  document.getElementById("class").value = kelas
  document.getElementById("program").value = program
  editId = id
}

// ================= DELETE =================
window.padam = async function(id) {
  if (!confirm("Serius nak padam rekod ni? 🗑️")) return

  const { error } = await supabase
    .from('pajsk_records')
    .delete()
    .eq('id', id)

  if (error) {
    alert("Gagal padam ❌")
    return
  }

  alert("Data berjaya dipadam 🗑️")
  loadData()
}

// ================= CLEAR =================
function clearInput() {
  document.getElementById("name").value = ""
  document.getElementById("class").value = ""
  document.getElementById("program").value = ""
}

// ================= EXPORT CSV =================
window.exportData = async function () {
  const { data } = await supabase.from('pajsk_records').select('*')

  let csv = "Nama,Kelas,Program\n"
  data.forEach(i => {
    csv += `${i.student_name},${i.class_name},${i.program_name}\n`
  })

  const blob = new Blob([csv])
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = "data.csv"
  a.click()
}

// ================= EXPORT PDF =================
window.exportPDF = async function () {

  const { data } = await supabase.from('pajsk_records').select('*')

  const { jsPDF } = window.jspdf
  const doc = new jsPDF()

  doc.text("Senarai PAJSK", 14, 10)

  doc.autoTable({
    head: [["Nama", "Kelas", "Program"]],
    body: data.map(i => [i.student_name, i.class_name, i.program_name])
  })

  doc.save("pajsk.pdf")
}

// ================= INIT =================
async function init() {
  await checkUser()
  await loadData()
}

init()