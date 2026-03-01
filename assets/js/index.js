const dateDiv = document.querySelector(".date");

        const hoje = new Date();

        const dias = [
            "domingo", "segunda-feira", "terça-feira",
            "quarta-feira", "quinta-feira", "sexta-feira", "sábado"
        ];

        const meses = [
            "janeiro", "fevereiro", "março", "abril",
            "maio", "junho", "julho", "agosto",
            "setembro", "outubro", "novembro", "dezembro"
        ]

        const diaDaSemana = dias[hoje.getDay()];
        const dia = hoje.getDate();
        const mes = meses[hoje.getMonth()];

        dateDiv.textContent = `📆 ${diaDaSemana}, ${dia} de ${mes}`;