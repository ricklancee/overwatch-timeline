class Timeline {

    constructor() {
        this.container = document.querySelector('.timeline__container');
        this.markers = this.container.querySelectorAll('.timeline__item');

        this.onScroll = this.onScroll.bind(this);
        this.update = this.update.bind(this);

        this.targetX = 0;
        this.currentX = 0;
        this.scrollPercent = 0;
        this.maxX = this.container.offsetWidth;
        this.minX = 0;

        // Todo: refacor
        this.markerPositions = [];
        [].forEach.call(this.markers, (marker) => {
            const width = marker.offsetWidth / 2;
            const left = marker.offsetLeft;
            const middle = left + width;
            this.markerPositions.push(middle-2); // 2 = timeline__marker width;
        });

        console.log('Marker positions', this.markerPositions);


        this.addEventListeners();
        requestAnimationFrame(this.update);
    }

    addEventListeners() {
        document.addEventListener('mousewheel', this.onScroll);

        // Tmp fun.
        this.container.addEventListener('click', _ => {
            if (this.targetX == this.maxX) {
                this.targetX = this.minX;
            } else if (this.targetX == this.minX) {
                this.targetX = this.maxX;
            } else {
                this.targetX = this.maxX;
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
        for (var i = 0; i < this.markerPositions.length; i++) {
            if (this.currentX > this.markerPositions[i]) {
                this.markers[i].classList.add('timeline__item--hit');
            } else if (this.currentX < this.markerPositions[i]) {
                this.markers[i].classList.remove('timeline__item--hit');
            }
        }

        this.scrollTimeline();
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
