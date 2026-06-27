console.log("✅ Sandbox JavaScript loaded.");
try {
console.log(document.cookie);} catch (error) {
    console.error(error);
}

const button = document.getElementById("testButton");

button?.addEventListener("click", () => {
    console.log("Button clicked inside sandbox.");
});