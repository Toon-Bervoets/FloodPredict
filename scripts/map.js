let previouslySearchedElement = null; // Variable to store the previously searched municipality
let floodData = {}; // To hold the flood scale data

// Fetch the flood scale data from the JSON file
fetch("api/floodscale")
  .then((response) => response.json())
  .then((data) => {
    // Determine min and max values
    const values = Object.values(data);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Function to interpolate color based on value
    function getColor(value) {
      const percentage = (value - minValue) / (maxValue - minValue);
      // Define colors for the gradient
      const color1 = [90, 158, 81]; // #5a9e51
      const color2 = [242, 220, 93]; // #f2dc5d
      const color3 = [228, 87, 46]; // #e4572e
      const color4 = [209, 47, 47]; // #d12f2f

      // Use a gradient interpolation
      let color;
      if (percentage <= 0.33) {
        color = color1.map((c, i) =>
          Math.round(c + (color2[i] - c) * (percentage / 0.33))
        );
      } else if (percentage <= 0.66) {
        color = color2.map((c, i) =>
          Math.round(c + (color3[i] - c) * ((percentage - 0.33) / 0.33))
        );
      } else {
        color = color3.map((c, i) =>
          Math.round(c + (color4[i] - c) * ((percentage - 0.66) / 0.34))
        );
      }
      return `rgb(${color.join(",")})`;
    }

    // Apply color to each municipality based on the value
    for (const [municipality, value] of Object.entries(data)) {
      const pathElement = document.getElementById(municipality); // Ensure municipality ID matches the SVG path ID
      if (pathElement) {
        pathElement.style.fill = getColor(value);
      }
    }
  })
  .catch((error) => console.error("Error loading the JSON data:", error));

document.querySelectorAll(".allPaths").forEach((e) => {
  // Add the id as an additional class without overwriting the existing ones
  e.classList.add(e.id);

  e.addEventListener("mouseover", function () {
    // Update tooltip position with the mouse movement
    window.onmousemove = function (j) {
      const x = j.clientX;
      const y = j.clientY;
      document.getElementById("name").style.top = y - 60 + "px";
      document.getElementById("name").style.left = x + 10 + "px";
    };

    // Remove highlight from the previously searched element if hovering over a new one
    if (previouslySearchedElement) {
      previouslySearchedElement.classList.remove("hovered");
      previouslySearchedElement = null; // Reset the previously searched element
    }

    // Apply thicker border and fill color for hovered municipality
    e.classList.add("hovered");

    // Get the province of the hovered municipality
    const hoveredProvince = e.getAttribute("data-province");

    // Dim all paths that don't belong to the same province
    document.querySelectorAll(".allPaths").forEach((gemeente) => {
      const province = gemeente.getAttribute("data-province");

      // If the municipality is not in the same province, dim it
      if (province !== hoveredProvince) {
        gemeente.classList.add("dimmed");
      }
    });

    // Show the name of the hovered municipality
    const hoofdGemeente = e.getAttribute("data-hoofd-gemeente");
    const gemeente = hoofdGemeente
      ? hoofdGemeente
      : e.getAttribute("data-gemeente");
    document.getElementById("name").style.opacity = 1;
    document.getElementById("data-gemeente").innerText = gemeente;
  });

  e.addEventListener("mouseleave", function () {
    // Remove the hover effects when the mouse leaves the municipality
    e.classList.remove("hovered");

    // Remove dimming from all municipalities
    document.querySelectorAll(".allPaths").forEach((gemeente) => {
      gemeente.classList.remove("dimmed");
    });

    // Hide the tooltip
    document.getElementById("name").style.opacity = 0;
  });

  e.addEventListener("click", function () {
    const hoofdGemeente = e.getAttribute("data-hoofd-gemeente");
    const gemeente = hoofdGemeente
      ? hoofdGemeente
      : e.getAttribute("data-gemeente");
    window.location.href = `/predict-info/${gemeente}`;
  });
});

// Function to search for municipality in the map
function searchMunicipality(searchValue) {
  let found = false;
  searchValue = searchValue.toLowerCase();

  // Reset previous highlights
  document.querySelectorAll(".allPaths").forEach((e) => {
    e.classList.remove("hovered");
    e.classList.remove("highlight");
    e.classList.remove("dimmed");
  });

  // Search for the matching municipality
  document.querySelectorAll(".allPaths").forEach((e) => {
    const gemeenteName = e.getAttribute("data-gemeente").toLowerCase().trim();
    const hoofdGemeente = e.getAttribute("data-hoofd-gemeente")
      ? e.getAttribute("data-hoofd-gemeente").toLowerCase().trim()
      : "";
    const postcode = e.getAttribute("data-postcode")
      ? e.getAttribute("data-postcode").toLowerCase().trim()
      : "";

    if (
      gemeenteName === searchValue ||
      hoofdGemeente === searchValue ||
      postcode === searchValue
    ) {
      // Only apply the highlight without resetting the entire map
      e.classList.add("hovered");
      previouslySearchedElement = e;

      const hoveredProvince = e.getAttribute("data-province");
      // Dim all paths that don't belong to the same province
      document.querySelectorAll(".allPaths").forEach((gemeente) => {
        const province = gemeente.getAttribute("data-province");
        if (province !== hoveredProvince) {
          gemeente.classList.add("dimmed");
        }
      });

      found = true;
    }
  });

  if (!found) {
    window.parent.postMessage({ type: "notFound" }, "*");
  }
}

// Listen for search messages from the parent page
window.addEventListener("message", (event) => {
  if (event.data.type === "search") {
    searchMunicipality(event.data.value);
  }
});
