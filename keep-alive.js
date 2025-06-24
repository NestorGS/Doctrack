const keepAlive = () => {
    setInterval(async () => {
        try {
            const response = await fetch("https://doctrack-production.up.railway.app/");
            console.log("Ping enviado, estado:", response.status);
        } catch (error) {
            console.error("Error en keep-alive:", error);
        }
    }, 300000); // Cada 5 minutos
};

keepAlive();