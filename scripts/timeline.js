class Timeline {

    constructor() {
        this.container = document.querySelector('.timeline__container');
        this.markers = document.querySelectorAll('.timeline__item');
        this.minimap = document.querySelector('.timeline__minimap');
        this.minimapIndicator = document.querySelector('.timeline__minimap__indicator');
        this.minimapMakerContainer = document.querySelector('.timeline__minimap__markers');

        this.onScroll = this.onScroll.bind(this);
        this.update = this.update.bind(this);

        this.targetX = 0;
        this.currentX = 0;
        this.scrollPercent = 0;
        this.maxX = this.container.offsetWidth;
        this.minX = 0;

        this.minimapWidth = this.minimap.offsetWidth;
        this.minimapCurrentX = 0;

        // Todo: refacor
        this.markerPositions = [];
        [].forEach.call(this.markers, (marker) => {
            const width = marker.offsetWidth / 2;
            const left = marker.offsetLeft;
            const middle = (left + width) - 2 // 2 = timeline__marker width;
            const percentage = (middle * 100) / this.maxX;
            this.markerPositions.push(percentage);
        });
        this.markersLength = this.markerPositions.length;


        console.log('Marker positions', this.markerPositions);

        this.createMinimapMarkers();

        this.addEventListeners();
        requestAnimationFrame(this.update);
    }

    addEventListeners() {
        document.addEventListener('mousewheel', this.onScroll);

        // Tmp fun.
        this.container.addEventListener('click', _ => {
            if (this.targetX == this.maxX) {
                this.targetX = this.minX;
                this.scrollPercent = 0
            } else if (this.targetX == this.minX) {
                this.targetX = this.maxX;
                this.scrollPercent = 100;
            } else {
                this.targetX = this.maxX;
                this.scrollPercent = 100;
            }
        });
    }

    onScroll(evt) {
        evt.preventDefault();

        if (this.targetX < this.minX) {
            this.targetX = this.minX;
            return;
        }

        if (this.targetX > this.maxX) {
            this.targetX = this.maxX;
            return;
        }

        // Todo: Adding evt.deltaX might be buggy
        this.targetX += (evt.deltaY + evt.deltaX) * 0.3;
        this.scrollPercent = Math.floor((this.targetX * 100) / this.maxX);
    }

    update() {
        requestAnimationFrame(this.update);

        // Todo: refactor
        for (var i = 0; i < this.markersLength; i++) {
            if (this.scrollPercent > this.markerPositions[i]) {
                this.markers[i].classList.add('timeline__item--hit');
            } else if (this.scrollPercent < this.markerPositions[i]) {
                this.markers[i].classList.remove('timeline__item--hit');
            }
        }

        this.scrollTimeline();
        this.updateMinimap();
    }

    createMinimapMarkers() {
        for (var i = 0; i < this.markersLength; i++) {
            const markerPercentage = this.markerPositions[i];
            const targetX = (markerPercentage * this.minimapWidth) / 100;

            this.minimapMakerContainer.innerHTML += `<div class="timeline__minimap__marker" style="transform: translateX(${targetX}px)"></div>`;
        }
    }

    updateMinimap() {
        const targetX = (this.scrollPercent * this.minimapWidth) / 100;
        this.minimapCurrentX += (targetX - this.minimapCurrentX) / 6;
        this.minimapIndicator.style.transform = `translateX(${this.minimapCurrentX}px)`;
    }

    // Scrolls the timeline to the target targetX;
    scrollTimeline() {
        this.currentX += (this.targetX - this.currentX) / 6;

        if (this.currentX <= this.minX) {
            this.currentX = this.minX;
            this.container.style.transform = `translateX(${-this.minX}px)`;
        } else if (this.currentX >= this.maxX) {
            this.currentX = this.maxX;
            this.container.style.transform = `translateX(${-this.maxX}px)`;
        } else {
            this.container.style.transform = `translateX(${-this.currentX}px)`;
        }
    }
}

window.addEventListener('load', _ => { new Timeline() });
