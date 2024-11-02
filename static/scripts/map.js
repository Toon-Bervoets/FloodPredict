let previouslyClickedElement = null; // Track the previously clicked municipality
let floodData = {}; // Store flood scale data
let isZoomedIn = false; // Track if zoom state is active

// Fetch the flood scale data from the JSON file
fetch('api/floodscale')
    .then(response => response.json())
    .then(data => {
        const values = Object.values(data);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        document.getElementById("min-label").innerText = minValue.toFixed(0);
        document.getElementById("max-label").innerText = maxValue.toFixed(0);

        // Function to interpolate color based on value
        function getColor(value) {
            const percentage = (value - minValue) / (maxValue - minValue);
            const color1 = [90, 158, 81];  // #5a9e51
            const color2 = [242, 220, 93];  // #f2dc5d
            const color3 = [228, 87, 46];  // #e4572e
            const color4 = [209, 47, 47];  // #d12f2f

            let color;
            if (percentage <= 0.33) {
                color = color1.map((c, i) => Math.round(c + (color2[i] - c) * (percentage / 0.33)));
            } else if (percentage <= 0.66) {
                color = color2.map((c, i) => Math.round(c + (color3[i] - c) * ((percentage - 0.33) / 0.33)));
            } else {
                color = color3.map((c, i) => Math.round(c + (color4[i] - c) * ((percentage - 0.66) / 0.34)));
            }
            return `rgb(${color.join(',')})`;
        }

        for (const [municipality, value] of Object.entries(data)) {
            const pathElement = document.getElementById(municipality);
            if (pathElement) {
                pathElement.style.fill = getColor(value);
            }
        }
    })
    .catch(error => console.error('Error loading the JSON data:', error));

document.querySelectorAll(".allPaths").forEach(e => {
    e.classList.add(e.id);

    e.addEventListener("mouseover", function () {
        window.onmousemove = function (j) {
            const x = j.clientX;
            const y = j.clientY;
            document.getElementById('name').style.top = y - 60 + 'px';
            document.getElementById('name').style.left = x + 10 + 'px';
        };

        e.classList.add("hovered");

        const hoveredProvince = e.getAttribute('data-province');
        document.querySelectorAll('.allPaths').forEach(gemeente => {
            const province = gemeente.getAttribute('data-province');
            if (province !== hoveredProvince) {
                gemeente.classList.add("dimmed");
            }
        });

        const hoofdGemeente = e.getAttribute('data-hoofd-gemeente');
        const gemeente = hoofdGemeente ? hoofdGemeente : e.getAttribute('data-gemeente');
        document.getElementById("name").style.opacity = 1;
        document.getElementById("data-gemeente").innerText = gemeente;
    });

    e.addEventListener("mouseleave", function () {
        e.classList.remove("hovered");
        document.querySelectorAll('.allPaths').forEach(gemeente => {
            gemeente.classList.remove("dimmed");
        });
        document.getElementById("name").style.opacity = 0;
    });

    e.addEventListener("click", function () {
        const closeButton = document.getElementById("close-region");
        if (!isZoomedIn) {
            // First click: zoom into province
            zoomIntoProvince(e);
            isZoomedIn = true;
            previouslyClickedElement = e;
            // Update the region display to show the selected province
            const selectedProvince = e.getAttribute('data-province'); 
            document.getElementById("region-selected").innerText = selectedProvince; 
            document.getElementById("region-selected-container").classList.remove('hidden'); 
            document.getElementById("region-selected-container").classList.add('visible');
            document.getElementById("region-selected").setAttribute('lang-key', selectedProvince);
            closeButton.style.display = 'inline'; 
        } else {
            const isMobile = window.innerWidth <= 800; // Check if the device is mobile
            if (isMobile) {
                // Mobile behavior
                const currentlyHighlighted = document.querySelector('.highlighted');
                const clickedElementIsHighlighted = currentlyHighlighted === e;

                // If the clicked element is the one that is already highlighted
                if (clickedElementIsHighlighted) {
                    const hoofdGemeente = e.getAttribute('data-hoofd-gemeente');
                    const gemeente = hoofdGemeente ? hoofdGemeente : e.getAttribute('data-gemeente');
                    window.location.href = `/predict-info/${gemeente}`; // Navigate to the info page
                } else {
                    // Remove highlight from previously highlighted element
                    if (currentlyHighlighted) {
                        currentlyHighlighted.classList.remove('highlighted');
                    }
                    // Highlight the clicked municipality
                    e.classList.add('highlighted');
                    const gemeente = hoofdGemeente ? hoofdGemeente : e.getAttribute('data-gemeente');
                    document.getElementById("name").innerText = gemeente; // Show the name

                    const selectedProvince = e.getAttribute('data-province');
                    document.getElementById("region-selected").innerText = selectedProvince;
                    document.getElementById("region-selected-container").classList.remove('hidden'); 
                    document.getElementById("region-selected-container").classList.add('visible');
                    document.getElementById("region-selected").setAttribute('lang-key', selectedProvince); 
                }
            } else {
                // PC behavior
                const hoofdGemeente = e.getAttribute('data-hoofd-gemeente');
                const gemeente = hoofdGemeente ? hoofdGemeente : e.getAttribute('data-gemeente');
                window.location.href = `/predict-info/${gemeente}`; // Navigate to the info page
                isZoomedIn = false; // Reset zoom state
                document.getElementById("region-selected-container").classList.remove('visible');
                document.getElementById("region-selected-container").classList.add('hidden');
            }
        }
    });
    
});

function zoomIntoProvince(element) {
    const selectedProvince = element.getAttribute('data-province');

    // Define viewboxes for each province (desktop and mobile)
    const viewboxes = {
        'Limburg': '517.22 15.76 299.02 307.42',
        'Antwerpen': '319.47 -50.05 346.45 260.37',
        'Oost-Vlaanderen': '141.59 -3.56 326.88 318.71',
        'West-Vlaanderen': '-35 -12.50 326.88 318.71',
        'Vlaams-Brabant': '-80 10.05 1076.24 413.46',
        'Brussel': '-112 32.05 1076.24 413.46'
    };

    // Mobile viewboxes
    const mobileViewboxes = {
        'Limburg': '121 -120 360 360',
        'Antwerpen': '45 -162 360 360',
        'Oost-Vlaanderen': '-49 -130 360 360',
        'West-Vlaanderen': '-125 -135 360 360',
        'Vlaams-Brabant': '30 -125 360 360',
        'Brussel': '8 -81 360 360'
    };
    // tablet viewboxes
    const tabletViewboxes = {
        'Limburg': '121 -120 360 360',
        'Antwerpen': '45 -162 360 360',
        'Oost-Vlaanderen': '-49 -130 360 360',
        'West-Vlaanderen': '-125 -135 360 360',
        'Vlaams-Brabant': '30 -125 360 360',
        'Brussel': '8 -81 360 360'
    };

    // Scale factors for desktop
    const scaleFactors = {
        'Limburg': 1.9,
        'Antwerpen': 2.0,
        'Oost-Vlaanderen': 1.8,
        'West-Vlaanderen': 1.8,
        'Vlaams-Brabant': 3.5,
        'Brussel': 9.0
    };

    // Scale factors for mobile
    const mobileScaleFactors = {
        'Limburg': 11.2,
        'Antwerpen': 10,
        'Oost-Vlaanderen': 10.8,
        'West-Vlaanderen': 10.8,
        'Vlaams-Brabant': 8.1,
        'Brussel': 35.0
    };
    // Scale factors for tablet
    const tabletScaleFactors = {
        'Limburg': 11.2,
        'Antwerpen': 10,
        'Oost-Vlaanderen': 10.8,
        'West-Vlaanderen': 10.8,
        'Vlaams-Brabant': 8.1,
        'Brussel': 35.0
    };

    // Determine if the device is mobile based on the window width
    const isMobile = window.innerWidth <= 800; // You can adjust this threshold as needed
    const currentViewboxes = isMobile ? mobileViewboxes : viewboxes;
    const currentScaleFactors = isMobile ? mobileScaleFactors : scaleFactors;
    const endfactor = isMobile ? 3.3 : 1.4
    // const isTablet = window.innerWidth <= 800;
    // const isMobile = window.innerWidth <= 600;
    // const currentViewboxes = isTablet ? isMobile ? mobileViewboxes : tabletViewboxes : viewboxes;
    // const currentScaleFactors = isTablet ? isMobile ? mobileScaleFactors : tabletScaleFactors : scaleFactors;
    // const endFactor = isTablet ? isMobile ? 3.3 : 2.5 : 1.4;

    // Show only the selected province's municipalities
    document.querySelectorAll('.allPaths').forEach(municipality => {
        municipality.style.display = (municipality.getAttribute('data-province') === selectedProvince) ? 'block' : 'none';
    });

    const svgWrapper = document.getElementById("svg-wrapper");
    const svgZoomContainer = document.getElementById("svg-zoom-container");

    if (currentViewboxes[selectedProvince]) {
        const [minX, minY, width, height] = currentViewboxes[selectedProvince].split(' ').map(Number);

        const wrapperWidth = svgWrapper.clientWidth; // Use actual width of the SVG wrapper
        const wrapperHeight = svgWrapper.clientHeight; // Use actual height of the SVG wrapper

        // Calculate scale based on wrapper dimensions and selected scale factor
        const scale = Math.min(wrapperWidth / width, (wrapperHeight - 60) / height) * currentScaleFactors[selectedProvince];

        // Calculate translation to center the province
        const translateX = (wrapperWidth - width * scale) / 2 - minX * scale;
        const translateY = (wrapperHeight - height * scale) / 2 - minY * scale;

        // Apply the transform to zoom container
        svgZoomContainer.style.transformOrigin = "0 0"; // Set the transform origin to the top-left corner
        svgZoomContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;

        // Optional: Adjust the height of the svg-zoom-container if necessary
        svgZoomContainer.style.height = `${height * Math.min(wrapperWidth / width, (wrapperHeight - 60) / height) * endfactor}px`;

    } else {
        console.error(`No viewbox found for province: ${selectedProvince}`);
    }
}








function resetZoom() {
    const svg = document.getElementById("svg-zoom-container");
    svg.style.transform = "scale(1) translate(0, 0)"; // Reset the zoom transformation
    isZoomedIn = false; // Reset zoom state

    // Show all municipalities again
    document.querySelectorAll('.allPaths').forEach(municipality => {
        municipality.style.display = 'block';
    });
    location.reload();
}

document.getElementById("close-region").addEventListener("click", function() {
    resetZoom(); // Call your existing resetZoom function
    document.getElementById("region-selected-container").classList.remove('visible');
    document.getElementById("region-selected-container").classList.add('hidden');
});

function searchMunicipality(searchValue) {
    let found = false;
    searchValue = searchValue.toLowerCase();

    document.querySelectorAll('.allPaths').forEach(e => {
        e.classList.remove("hovered", "highlight", "dimmed");
    });

    document.querySelectorAll('.allPaths').forEach(e => {
        const gemeenteName = e.getAttribute('data-gemeente').toLowerCase().trim();
        const hoofdGemeente = e.getAttribute('data-hoofd-gemeente') ? e.getAttribute('data-hoofd-gemeente').toLowerCase().trim() : "";
        const postcode = e.getAttribute('data-postcode') ? e.getAttribute('data-postcode').toLowerCase().trim() : "";

        if (gemeenteName === searchValue || hoofdGemeente === searchValue || postcode === searchValue) {
            e.classList.add("hovered");
            zoomIntoProvince(e);
            isZoomedIn = true;
            found = true;
        }
    });

    if (!found) {
        window.parent.postMessage({ type: "notFound" }, "*");
    }
}

window.addEventListener("message", (event) => {
    if (event.data.type === "search") {
        searchMunicipality(event.data.value);
    }
});