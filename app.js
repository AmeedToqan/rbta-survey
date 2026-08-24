const form = document.querySelector("form");

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const submitButton =
            form.querySelector('button[type="submit"]') ||
            form.querySelector("button");

        const originalText = submitButton ? submitButton.textContent : "";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "???? ???????...";
        }

        try {
            const formData = new FormData(form);
            const data = {};

            formData.forEach((value, key) => {
                data[key] = value;
            });

            const response = await fetch("/.netlify/functions/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    result.error || "???? ????? ????"
                );
            }

            alert("? ?? ????? ???? ?????? ????? ??!");

            form.reset();

        } catch (error) {

            console.error("Submit error:", error);

            alert(
                "? ???? ????? ????.\n\n" +
                "???? ?? ?????? ???? ????? ??? ????."
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    });
}


