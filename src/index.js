import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const elements = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  formContainer: document.querySelector('.gallery'),
  addField: document.querySelector('.submit'),
  upButton: document.querySelector('.round-button'),
  guardJs: document.querySelector('.for_upButton'),
};

const BASE_URL = 'https://pixabay.com/api/';

async function fetchImages(inputValue, page) {
  const params = new URLSearchParams({
    key: '38393469-c3ed0194fa41e0d5130fcf9c2',
    q: inputValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: `${page}`,
  });
  const { data } = await axios.get(`${BASE_URL}?${params}`);
  console.log(data);
  return data;
}

elements.form.addEventListener('submit', onFormSubmit);
const simpleLightbox = new SimpleLightbox('.gallery a');

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};

let observer = new IntersectionObserver(handlerPagination, options);

elements.upButton.addEventListener('click', scrolTop);

let inputValue;

let page = 1;

async function onFormSubmit(e) {
  try {
    e.preventDefault();
    Loading.arrows();
    inputValue = elements.input.value.trim();

    observer.observe(elements.guardJs);
    const { hits, totalHits } = await fetchImages(inputValue);
    Notify.success(`Hooray! We found ${totalHits} images`);
    elements.formContainer.innerHTML = createMarkup(hits);
    simpleLightbox.refresh();
    e.target.reset();
  } catch (error) {
    Report.warning('Invalid input', 'Please enter a valid search query.');
    console.log(error);
  } finally {
    Loading.remove();
  }
}
function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a class="gallery-link" href=${largeImageURL}>
             <img class="gallery-image" width="350"src=${webformatURL} alt=${tags} loading="lazy" />
                   <div class="info-item">
                       <b>Likes</b>
                       ${likes}
                   </div>
                   <div class="info-item">
                       <b>Views</b>
                       ${views}
                   </div>
                   <div class="info-item">
                       <b>Comments</b>
                       ${comments}
                   </div>
                   <div class="info-item">
                       <b>Downloads</b>
                       ${downloads}
                   </div>
               
           </div>
       </a>
       `
    )
    .join('');
}

function scrolTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
  elements.upButton.style.visibility = 'hidden';
}

async function handlerPagination(entries, observer) {
  for (let entry of entries) {
    if (entry.isIntersecting) {
      try {
        page += 1;
        const { hits, totalHits } = await fetchImages(inputValue, page);
        elements.formContainer.insertAdjacentHTML(
          'beforeend',
          createMarkup(hits)
        );
        Loading.arrows();
        simpleLightbox.refresh();
        if (hits.length === 0) {
          Report.failure(
            'Ups',
            "We're sorry, but you've reached the end of search results."
          );
          elements.upButton.style.visibility = 'visible';
        }
      } catch (err) {
        console.log(err);
        elements.upButton.style.visibility = 'visible';
        Report.failure(
          'Ups',
          "We're sorry, but you've reached the end of search results."
        );
      } finally {
        Loading.remove();
      }
    }
  }
}
//
