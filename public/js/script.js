const video = document.getElementById('videoInput')
const capture = document.getElementById('capture')
const headTitle = document.getElementById('head-title')
let interval;


setTimeout(() => {
    capture.removeAttribute('disabled');
    capture.innerText = 'Verify Now';
}, 5000);


Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
]).then(start)

function start() {
    //document.body.append('Models Loaded')
    //DEPRECATED
    navigator.getUserMedia(
        { video: {} },
        stream => { video.srcObject = stream },
        err => console.error(err)
    )

    //video.src = '../videos/speech.mp4'
    console.log('video added')
    recognizeFaces()
}

async function recognizeFaces() {

    const labeledDescriptors = await loadLabeledImages()
    //console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5) //dissimilarity range


    capture.addEventListener('click', async () => {
        console.log('Playing')
        const canvas = faceapi.createCanvasFromMedia(video)
        // document.body.append(canvas)

        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)


        var count = 0 //mine
        var preAns = [] //mine
        interval = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

            const results = resizedDetections.map((d) => {
                // console.log(d)
                return faceMatcher.findBestMatch(d.descriptor)
            })
            results.forEach((result, i) => {
                // dissimilarity
                // console.log(result.distance)
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)

                count++ //mine
                preAns.push(result.toString()) //mine
                //console.log('count='+count+'  ans= '+result.toString())//mine
                if (count === 16) {//mine
                    finalExecution(preAns)//mine
                } //mine
            })
        }, 10)

    })
}

function loadLabeledImages() {
    //const labels = ['Black Widow', 'Captain America', 'Hawkeye' , 'Jim Rhodes', 'Tony Stark', 'Thor', 'Captain Marvel']
    const labels = ['P541000', 'C171026', '1111122222', '123456'] // for WebCam
    return Promise.all(
        labels.map(async (label) => {
            const descriptions = []
            for (let i = 1; i <= 3; i++) {
                const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                // console.log(label + i + JSON.stringify(detections))
                descriptions.push(detections.descriptor)
            }
            // document.body.append(label + ' Faces Loaded | ')
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

function finalExecution(preAns) {
    //mine
    let shortenedAns = [];
    for (let j = 0; j < 11; j++) {
        shortenedAns[j] = preAns[j].substring(0, 7)
    }
    let ans = mostFrequent(shortenedAns);
    console.log("Verified: " + ans);
    if (ans === -1) {
        headTitle.innerText = "Verification Failed"
        headTitle.classList.add("heading-danger")
        console.log("Not verified,Try Again")
        alert("Verification Failed, Please Retry")
        window.location.reload();
    }
    else {
        headTitle.innerText = 'Verification Successful';
        headTitle.classList.add("heading-success");
        console.log('The photo is of: ' + ans);
        clearInterval(interval);
        //send user to vote page
        window.location.replace('http://localhost:3000/vote')
    }
    //console.log(shortenedAns);
    //clearInterval(interval);
    //mine->ends here
}

function mostFrequent(arr) {
    let mf = 1, m = 0, item, unknown = "unknown";

    for (let k = 0; k < arr.length; k++) {
        for (let j = k; j < arr.length; j++) {
            if (arr[k] == arr[j]) m++;
            if (mf < m) {
                mf = m;
                item = arr[k];
            }
        }

        m = 0;
    }
    //console.log('item: '+ item + ' occurance: '+ mf +'  type: '+typeof(item)+'  length: '+item.length)
    if (item === unknown) return -1;
    if (mf > 5) return item;
    else return -1;
    //alert(item + " ( " + mf + " times ) ");
}