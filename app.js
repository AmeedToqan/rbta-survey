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
            submitButton.textContent = "جاري الإرسال...";
        }

        try {
            const formData = new FormData(form);
            const data = {};

            formData.forEach((value, key) => {
                data[key] = value;
            });

            const response = await fetch("/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    result.error || "تعذر إرسال الرد"
                );
            }

            alert("✅ تم إرسال رأيك بنجاح، شكرًا لك!");

            form.reset();

        } catch (error) {

            console.error("Submit error:", error);

            alert(
                "❌ تعذر إرسال الرد.\n\n" +
                "تأكد أن الخادم يعمل وحاول مرة أخرى."
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    });
}
