document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", performSearch);
});

const performSearch = async () => {
  // Show the loader
  const loader = document.getElementById("loader");
  loader.style.display = "block";
  const searchInput = document.getElementById("searchInput").value;
  const resultsDiv = document.getElementById("results");

  // You can replace this URL with the actual API endpoint
  // const apiUrl = await fetch(`http://localhost:5000/dev/search_students`, {
  const apiUrl = await fetch(`https://api-nunsaunicaldev.onrender.com/dev/search_students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ searchInput }),
  });

  // Hide the loader after receiving the API response
  loader.style.display = "none";
  if (!apiUrl.ok) {
    // Handle non-200 response codes
    const data = await apiUrl.json(); // Use apiUrl instead of response
    resultsDiv.innerHTML = data;
    return;
  }

  const data = await apiUrl.json(); // Use apiUrl instead of response
  resultsDiv.innerHTML = ""; // Clear previous results
  data.forEach((result) => {
    // Create a div to hold the student information
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("custom-result-style");
    
    // Create the first p tag for student name
    const nameParagraph = document.createElement("span");
    nameParagraph.textContent = `${result.student_fname} ${result.student_lname}`;
    
    // Create the second p tag for student mat number
    const matNoParagraph = document.createElement("span");
    matNoParagraph.textContent = result.student_mat_no;
    matNoParagraph.classList.add("float-right");
    
    // Append both p tags to the div
    resultDiv.appendChild(nameParagraph);
    resultDiv.appendChild(matNoParagraph);
    
    // Append the div to the resultsDiv
    resultsDiv.appendChild(resultDiv);
  });
  
};
