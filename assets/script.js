document.getElementById("kompres-gambar").addEventListener("submit", (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("gambar");
  const kualitas = document.getElementById("kualitas").value;
  const formData = new FormData();

  if (fileInput.files.length === 0) {
    Swal.fire({
      title: "Gagal!",
      text: "Silakan unggah gambar terlebih dahulu.",
      icon: "error",
    });
    return;
  }

  const progressBar = document.getElementById("progress-bar");
  const progressContainer = document.getElementById("progress-container");
  progressContainer.classList.remove("d-none");

  // Set awal 10%
  updateProgress(10, "Menyiapkan data...");

  formData.append("gambar", fileInput.files[0]);
  formData.append("kualitas", kualitas);

  axios
    .post("proses-data.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        // Skala upload dari 10% sampai 80%
        const percentUploaded = Math.round(
          (progressEvent.loaded * 70) / progressEvent.total
        ); // maks 70%
        const totalPercent = 10 + percentUploaded; // dari 10% naik ke 80%
        updateProgress(totalPercent, "Mengupload gambar...");
      },
    })
    .then((res) => {
      // Update ke 90% karena server sedang memproses gambar
      updateProgress(90, "Memproses gambar...");

      setTimeout(() => {
        const data = res.data;

        const formatSize = (bytes) => {
          const kb = bytes / 1024;
          return kb.toFixed(2) + " KB";
        };

        updateProgress(100, "Selesai!");

        setTimeout(() => {
          // Sembunyikan progress bar setelah 1 detik
          progressContainer.classList.add("d-none");
        }, 1000);

        Swal.fire({
          title: "Berhasil",
          text: "Gambar berhasil Di kompres",
          icon: "success",
        });

        document.getElementById("hasil-kompres").innerHTML = `
          <div class="row mt-5 justify-content-center">
            <div class="col-lg-10">
              <div class="card border-0 shadow-lg p-4 rounded-4">
                <div class="card-body">
                  <div class="row justify-content-center align-items-center text-center g-3">
                    <div class="col-md-5">
                      <h5 class="mb-2 text-muted">Sebelum</h5>
                      <img src="${
                        data.originalPath
                      }" class="img-fluid rounded shadow-sm mb-2" alt="Sebelum" />
                      <p class="text-muted">Ukuran: ${formatSize(
                        data.originalSize
                      )}</p>
                    </div>
                    <div class="col-md-2 d-flex justify-content-center align-items-center">
                      <span class="fw-bold text-primary fs-2 rounded-circle px-3 py-1 shadow bg-white">VS</span>
                    </div>
                    <div class="col-md-5">
                      <h5 class="mb-2 text-muted">Sesudah</h5>
                      <img src="${
                        data.compressedPath
                      }" class="img-fluid rounded shadow-sm mb-2" alt="Sesudah" />
                      <p class="text-muted">Ukuran: ${formatSize(
                        data.compressedSize
                      )}</p>
                    </div>
                  </div>
                  <div class="row mt-4 text-center">
                    <div class="col">
                      <p class="text-muted">Kualitas Kompresi: ${kualitas}%</p>
                      <h4 class="text-success fw-semibold">🎉 Berhasil Dikompres ${
                        data.compressionRate
                      }%!</h4>
                      <a href="${
                        data.compressedPath
                      }" class="btn btn-primary mt-2 px-4" download>Download</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      }, 500); // kasih delay supaya efek progress 90–100% terasa
    })
    .catch((err) => {
      progressContainer.classList.add("d-none");
      Swal.fire({
        title: "Terjadi Kesalahan",
        text: "Gagal mengupload atau mengompres gambar.",
        icon: "error",
      });
    });

  function updateProgress(value, label = "") {
    progressBar.style.width = value + "%";
    progressBar.innerText = value + "%";
    progressBar.setAttribute("aria-valuenow", value);
    if (label) progressBar.setAttribute("data-label", label);
  }
});
