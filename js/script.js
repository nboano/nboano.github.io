function scrollSmoothTo(e) {
    e.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
    });
}
window.onload = () => {
    let cElementInd = 0;
    let slideCollection = document.querySelectorAll(".centroPagina");

    const moverel = (index) => {
        cElementInd += index;
        if (cElementInd == slideCollection.length) cElementInd = 0;
        if (cElementInd < 0) cElementInd = slideCollection.length - 1;
        scrollSmoothTo(slideCollection[cElementInd]);
    }

    document.onkeydown = (e) => {
        switch (e.keyCode) {
            case 39: // FRECCIA DESTRA / GIU
                moverel(+1);
                break;
            case 37: // FRECCIA SX / SU
                moverel(-1);
                break;
        }
    }
}