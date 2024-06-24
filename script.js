let jm;

document.addEventListener("DOMContentLoaded", () => {
    const mind = {
        meta: {
            name: "jsMind",
            author: "hizzgdev",
            version: "0.2"
        },
        format: "node_array",
        data: [
            { "id": "root", "isroot": true, "topic": "Tema Principal" }
        ]
    };

    const options = {
        container: 'jsmind_container',
        editable: true,
        theme: 'greensea'
    };

    jm = jsMind.show(options, mind);

    jm.add_event_listener((type, node) => {
        if (type === 'select') {
            fetchInfo(node.topic);
        }
    });
});

function addNode() {
    const input = document.getElementById('theme-input');
    const themeName = input.value.trim();
    const color = document.getElementById('color-picker').value;
    if (themeName === '') return;

    const selectedNode = jm.get_selected_node();
    const parentId = selectedNode ? selectedNode.id : 'root';
    const nodeId = jsMind.util.uuid.newid();
    jm.add_node(parentId, nodeId, themeName, { "background-color": color });

    input.value = '';
}

function fetchInfo(topic) {
    fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`)
        .then(response => response.json())
        .then(data => {
            const infoContent = document.getElementById("info-content");
            if (data.extract) {
                infoContent.innerHTML = `<h3>${data.title}</h3><p>${data.extract}</p>`;
            } else {
                infoContent.innerHTML = `<p>Não foram encontradas informações sobre "${topic}".</p>`;
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            const infoContent = document.getElementById("info-content");
            infoContent.innerHTML = `<p>Ocorreu um erro ao buscar informações.</p>`;
        });
}

function processa() {
    const term = document.getElementById("termo").value.trim();
    if (term === '') return;

    fetch(`https://pt.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(term)}`)
        .then(response => response.json())
        .then(data => {
            const pages = data.query.pages;
            const page = pages[Object.keys(pages)[0]];
            const mainText = page.extract;

            if (mainText) {
                document.getElementById("resposta").innerHTML = mainText;
            } else {
                document.getElementById("resposta").innerHTML = `Não encontrei explicação para "${term}".`;
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById("resposta").innerHTML = 'Ocorreu um erro ao buscar informações.';
        });
}

function downloadMindMapAsImage(format) {
    html2canvas(document.getElementById('jsmind_container')).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL(`image/${format}`);
        link.download = `mindmap.${format}`;
        link.click();
    });
}

function downloadMindMapAsPDF() {
    html2canvas(document.getElementById('jsmind_container')).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'JPEG', 0, 0);
        pdf.save('mindmap.pdf');
    });
}
