class Slider {
    constructor(slider) {
        this.slider = slider;

        this.controls = {
            prev: this.slider.querySelector('.slider__controls--prev'),
            next: this.slider.querySelector('.slider__controls--next'),
            fullscreenClose: this.slider.querySelector('.slider__fullscreen-close')
        }

        this.wrapper = this.slider.querySelector('.slider__wrapper');

        this.images = this.wrapper.querySelectorAll('img');

        this.currentIndexBox = this.slider.querySelector('.current-index');
        this.imageQuantityBox = this.slider.querySelector('.image-quantity');

        this.currentIndex = 0;
        this.imageQuantity = this.wrapper.children.length;

        this.isFullscreen = false;

        this.observer();

        this.sliderInit();
    }

    observer() {
        const imageWrappers = this.slider.querySelectorAll('.slider__image-wrapper');

        imageWrappers.forEach(wrapper => {
            wrapper.classList.add('slider__image-wrapper--lazy');
        });

        const options = {
            root: this.wrapper,
            rootMargin: '0px',
            threshold: .1
        }

        const callback = (entries, observer) => {
            let [ entry ] = entries;
            let { target } = entry;

            if(entry.isIntersecting) {
                const src = target.dataset[this.isFullscreen ? 'srcFs' : 'src'];
                target.src = src;

                target.addEventListener('load', e => {
                    setTimeout(() => {
                        target.parentElement.classList.remove('slider__image-wrapper--lazy');
                    }, 500)
                })

                observer.unobserve(target);
            }
        }

        const observer = new IntersectionObserver(callback, options);

        this.images.forEach(image => {
            observer.observe(image);
        });
    }

    sliderInit() {
        this.imageQuantityBox.innerText = this.imageQuantity;

        this.controls.next.addEventListener('click', this.moveSlider.bind(this, 'next'));
        this.controls.prev.addEventListener('click', this.moveSlider.bind(this, 'prev'));

        this.controls.fullscreenClose.addEventListener('click', this.toggleFullscreen.bind(this, 'close'));

        document.addEventListener('click', e => {
            let { target } = e;

            if(!(target.dataset.key && this.isFullscreen)) return;
            this.toggleFullscreen('close');
        });

        this.wrapper.addEventListener('click', e => {
            if(this.isFullscreen) return;

            this.toggleFullscreen('open');
        });

        this.swipeActions();

        this.keyControls();
    }

    moveSlider(direction) {
        let sliderItems = [...this.wrapper.children];
        let condition = null;

        direction === 'prev' ? this.currentIndex -= 1 : this.currentIndex += 1

        this.controllersHandler();
        this.currentIndexIndicator();

        condition = direction === 'prev' ? this.currentIndex < 0 : this.currentIndex >= this.imageQuantity < 0;

        if(condition) {
            return;
        }

        sliderItems.forEach(item => {
            item.style.transform = `translateX(-${this.currentIndex}00%)`;
        });
    }

    controllersHandler() {
        let target = this.slider.querySelector('.slider__controls--hidden');

        if(target) target.classList.remove('slider__controls--hidden');

        if(this.currentIndex === 0) this.controls.prev.classList.add('slider__controls--hidden');

        if(this.currentIndex === this.imageQuantity - 1) this.controls.next.classList.add('slider__controls--hidden');
    }

    currentIndexIndicator() {
        this.currentIndexBox.innerText = this.currentIndex + 1;
    }

    toggleFullscreen(action = 'open') {
        this.slider.classList[action === 'open' ? 'add' : 'remove']('slider--fullscreen');
        this.observer();
        this.isFullscreen = action === 'open';
        this.adaptiveImage();
    }

    adaptiveImage() {
        const currentImage = this.images[this.currentIndex];
        currentImage.src = currentImage.dataset[this.isFullscreen ? 'srcFs' : 'src'];

        currentImage.addEventListener('load', e => {
            currentImage.parentElement.classList.remove('slider__image-wrapper--lazy');
        });
    }

    swipeActions() {
        let position = {
            startPos: null,
            endPos: null
        }

        this.wrapper.addEventListener('touchstart', setPosition.bind(null, 'startPos'));

        this.wrapper.addEventListener('touchmove', setPosition.bind(null, 'endPos'));

        this.wrapper.addEventListener('touchend', e => {
            const { startPos } = position;
            const { endPos } = position;

            let direction = null;

            direction = (endPos - startPos) > 0 ? 'prev' : 'next';

            if(this.currentIndex === 0 && direction === 'prev') return;

            if(this.currentIndex === this.imageQuantity - 1 && direction === 'next') return;

            this.moveSlider(direction);
        });

        function setPosition(checkpoint, e) {
            const [touch] = e.touches;
            position[checkpoint] = touch.clientX;
        }
    }

    keyControls() {
        document.addEventListener('keydown', e => {
            if(!this.isFullscreen) return;

            const { keyCode } = e;

            const ARROW_RIGHT = 39;
            const ARROW_LEFT = 37;
            const ESC = 27;


            if(keyCode === ARROW_RIGHT) {
                if(this.currentIndex === this.imageQuantity - 1) return;

                this.moveSlider('next');
            }

            if(keyCode === ARROW_LEFT) {
                if(this.currentIndex === 0) return;

                this.moveSlider('prev');
            }

            if(keyCode === ESC) {
                this.toggleFullscreen('close');
            }
        })
    }

    static init(slider) {
        let key = slider.dataset.key;

        if(!(key in Slider._instances)) {
            Slider._instances[key] = new Slider(slider);
        }

        return Slider._instances[key]
    }
}

Slider._instances = {};

module.exports = Slider;