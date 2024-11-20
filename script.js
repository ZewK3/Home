async function submitData() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    const data = { name, email, message };
    const apiURL = "https://script.google.com/macros/s/AKfycbwJUCBN2Z00QjjB64jelH95NkdFjQ5SS3gDRQKg9377SRY-lHND8rB6OLqo_dxSIKP1/exec"; // Thay bằng URL của Google Apps Script

    try {
        const response = await fetch(apiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            mode: "cors"
        });
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        alert("Có lỗi xảy ra: " + error.message);
    }
}
