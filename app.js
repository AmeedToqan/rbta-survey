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
            submitButton.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u0625\u0631\u0633\u0627\u0644...";
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
                    result.error || "\u062A\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u062F."
                );
            }

            alert("\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0625\u062C\u0627\u0628\u062A\u0643 \u0628\u0646\u062C\u0627\u062D\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0643!");

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
