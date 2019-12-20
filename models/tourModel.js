const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: [true, 'A tour must have a name.'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have <= 40 characters.'],
      minlength: [10, 'A tour name must have >= 10 characters.']
      // validate: [validator.isAlpha, 'Tour name must only contain letters.'] // do not invoke(). This is commented because it disallows spaces.
    },
    slug: String,
    duration: {
      type: Number
      // required: [true, 'A tour must have a duration.']
    },
    maxGroupSize: {
      type: Number
      // required: [true, 'A tour must have a group size.']
    },
    difficulty: {
      type: String,
      // required: [true, 'A tour must have a difficulty rating'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be either easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must not exceed 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number
      // required: [true, 'A tour must have a price.']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // custom validator fxn: false triggers validation error
          return val < this.price; // 'this' only points to current doc on create, but not on update.
        },
        message: 'Discount price ({VALUE}) should be lower than regular price.'
      }
    },
    summary: {
      type: String,
      trim: true
      // required: [true, 'A tour must have a summary.']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String
      // required: [true, 'A tour must have a cover image.']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);



// Document Middleware: (runs before .save() and .create(), but NOT insertMany(). )
toursSchema.pre('save', function (next) {
  //  console.log(this); // "this" is bound to current document being saved.
  this.slug = slugify(this.name, { lower: true });
  next();
});

toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // 'this' points to current document, hence the es5 function
});

// toursSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// toursSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
toursSchema.pre(/^find/, function (next) {
  // this fxn filters out tours where secretTour === true when the "find", "findOne", or "findById" hooks run.
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

toursSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log({ docs });
  next();
});

// AGGREGATION MIDDLEWARE
toursSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline()); // 'this' points to current aggregation object
  next();
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
