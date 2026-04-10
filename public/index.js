const api = "/users";

let editingId = null;

async function loadUsers() {

    const res = await fetch(api);
    const users = await res.json();

    const list = document.getElementById("users");
    list.innerHTML = "";

    if (!users.length) {
        list.innerHTML = "<p style='text-align:center'>Nenhum usuário cadastrado</p>";
        return;
    }

    users.forEach(user => {

        const li = document.createElement("li");

        li.innerHTML = `
        <div class="user-info">
            <span class="user-name">${user.name}</span>
            <span class="user-age">${user.age} anos</span>
        </div>

        <div class="actions">
            <button class="btn-edit">Editar</button>
            <button class="btn-delete">Excluir</button>
        </div>
        `;

        // BOTÕES
        const editBtn = li.querySelector(".btn-edit");
        const deleteBtn = li.querySelector(".btn-delete");

        editBtn.onclick = () => prepareEdit(user._id, user.name, user.age);
        deleteBtn.onclick = () => deleteUser(user._id);

        list.appendChild(li);

    });

}

async function saveUser() {

    const nameInput = document.getElementById("name");
    const ageInput = document.getElementById("age");

    const name = nameInput.value.trim();
    const age = Number(ageInput.value);

    if (!name || !age) {
        alert("Preencha nome e idade");
        return;
    }

    const data = { name, age };

    if (editingId) {

        await fetch(`${api}/${editingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

    } else {

        await fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

    }

    cancelEdit();

    loadUsers();

}

async function deleteUser(id) {

    if (!confirm("Excluir usuário?")) return;

    await fetch(`${api}/${id}`, {
        method: "DELETE"
    });

    loadUsers();

}

function prepareEdit(id, name, age) {

    editingId = id;

    document.getElementById("name").value = name;
    document.getElementById("age").value = age;

    document.getElementById("saveBtn").textContent = "Atualizar";
    document.getElementById("cancelBtn").style.display = "inline-block";

}

function cancelEdit() {

    editingId = null;

    document.getElementById("name").value = "";
    document.getElementById("age").value = "";

    document.getElementById("saveBtn").textContent = "Adicionar Usuário";
    document.getElementById("cancelBtn").style.display = "none";

}

document.addEventListener("DOMContentLoaded", loadUsers);