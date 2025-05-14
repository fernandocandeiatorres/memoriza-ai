import { type Flashcard, type GenerateFlashcardsRequest } from "@shared/schema";

// This is a temporary mock function that simulates the backend Go API
export function mockGenerateFlashcards(request: GenerateFlashcardsRequest): Flashcard[] {
  const { topic, difficulty } = request;
  const topicId = Math.floor(Math.random() * 10000);
  
  console.log(`Gerando flashcards mock para tópico: ${topic}, dificuldade: ${difficulty}`);
  
  const flashcards: Flashcard[] = [
    {
      id: topicId + 1,
      topic,
      question: `What are the four chambers of the heart and their primary functions?`,
      answer: `<p><strong>The four chambers of the heart are:</strong></p>
      <ol>
        <li><strong>Right Atrium:</strong> Receives deoxygenated blood from the body via the superior and inferior vena cavae.</li>
        <li><strong>Right Ventricle:</strong> Pumps deoxygenated blood to the lungs via the pulmonary artery.</li>
        <li><strong>Left Atrium:</strong> Receives oxygenated blood from the lungs via the pulmonary veins.</li>
        <li><strong>Left Ventricle:</strong> Pumps oxygenated blood to the body via the aorta (main pumping chamber).</li>
      </ol>
      <p>The atria are thin-walled, low-pressure chambers that receive blood, while ventricles are thicker-walled, high-pressure chambers that pump blood out of the heart.</p>`
    },
    {
      id: topicId + 2,
      topic,
      question: `Describe the cardiac conduction system and the pathway of electrical impulses through the heart.`,
      answer: `<p><strong>The cardiac conduction system consists of:</strong></p>
      <ol>
        <li><strong>Sinoatrial (SA) Node:</strong> Primary pacemaker located in the right atrium. Generates impulses at 60-100 bpm.</li>
        <li><strong>Atrioventricular (AV) Node:</strong> Located at the boundary of atria and ventricles. Delays impulses by about 0.1 seconds.</li>
        <li><strong>Bundle of His:</strong> Passes impulse from AV node to the ventricles.</li>
        <li><strong>Bundle Branches:</strong> Right and left branches conduct impulses to respective ventricles.</li>
        <li><strong>Purkinje Fibers:</strong> Terminal fibers that distribute impulses throughout ventricular myocardium.</li>
      </ol>
      <p>This system ensures coordinated contraction: atria first, then ventricles.</p>`
    },
    {
      id: topicId + 3,
      topic,
      question: `Explain cardiac output, stroke volume, and how they relate to each other.`,
      answer: `<p><strong>Key relationships:</strong></p>
      <ul>
        <li><strong>Cardiac Output (CO):</strong> The volume of blood pumped by the heart per minute, measured in L/min.</li>
        <li><strong>Stroke Volume (SV):</strong> The volume of blood pumped by the ventricle in one contraction, measured in mL/beat.</li>
        <li><strong>Heart Rate (HR):</strong> Number of heart beats per minute (bpm).</li>
      </ul>
      <p><strong>Formula:</strong> CO = SV × HR</p>
      <p>Normal values (at rest): CO ≈ 5 L/min, SV ≈ 70 mL/beat, HR ≈ 70 bpm</p>
      <p>Cardiac output can increase during exercise to 20-25 L/min through increases in both HR and SV.</p>`
    },
    {
      id: topicId + 4,
      topic,
      question: `What are the major heart valves and their functions?`,
      answer: `<p><strong>The heart has four valves:</strong></p>
      <ol>
        <li><strong>Tricuspid Valve:</strong> Between right atrium and right ventricle. Prevents backflow during right ventricular contraction.</li>
        <li><strong>Pulmonary Valve:</strong> Between right ventricle and pulmonary artery. Prevents backflow into the right ventricle.</li>
        <li><strong>Mitral Valve (Bicuspid):</strong> Between left atrium and left ventricle. Prevents backflow during left ventricular contraction.</li>
        <li><strong>Aortic Valve:</strong> Between left ventricle and aorta. Prevents backflow into the left ventricle.</li>
      </ol>
      <p>The atrioventricular valves (tricuspid and mitral) are connected to papillary muscles via chordae tendineae to prevent valve eversion during ventricular contraction.</p>`
    },
    {
      id: topicId + 5,
      topic,
      question: `Describe the coronary circulation and its importance.`,
      answer: `<p><strong>Coronary circulation is the circulatory system supplying the heart itself:</strong></p>
      <ul>
        <li><strong>Right Coronary Artery (RCA):</strong> Typically supplies the right atrium, right ventricle, SA node (in 60% of people), and AV node (in 90% of people).</li>
        <li><strong>Left Main Coronary Artery:</strong> Branches into the Left Anterior Descending (LAD) and Left Circumflex (LCx) arteries.</li>
        <li><strong>LAD:</strong> Supplies the anterior interventricular septum and anterior wall of left ventricle.</li>
        <li><strong>LCx:</strong> Supplies the left atrium and lateral/posterior walls of left ventricle.</li>
      </ul>
      <p>Coronary arteries fill during diastole (when the heart muscle relaxes), not systole. Blockage of coronary arteries leads to ischemia and potential myocardial infarction (heart attack).</p>`
    },
    {
      id: topicId + 6,
      topic,
      question: `Explain the Frank-Starling law of the heart.`,
      answer: `<p>The Frank-Starling law states that the stroke volume of the heart increases in response to an increase in the volume of blood filling the heart (end-diastolic volume).</p>
      <p><strong>Key concepts:</strong></p>
      <ol>
        <li>Increased venous return → increased EDV → stretching of cardiac muscle fibers</li>
        <li>Stretching leads to increased force of contraction due to optimal overlap of actin and myosin filaments</li>
        <li>Result: increased stroke volume and cardiac output</li>
      </ol>
      <p>This mechanism allows the heart to adjust output based on venous return, ensuring equal output from both ventricles despite varying inputs. It functions without neural or hormonal input as an intrinsic property of cardiac muscle.</p>`
    },
    {
      id: topicId + 7,
      topic,
      question: `What are the phases of the cardiac cycle?`,
      answer: `<p>The cardiac cycle has two main phases: systole (contraction) and diastole (relaxation), with multiple sub-phases:</p>
      <ol>
        <li><strong>Atrial Systole:</strong> Atrial contraction pushes remaining blood into ventricles (~25% of filling)</li>
        <li><strong>Ventricular Systole:</strong>
          <ul>
            <li><strong>Isovolumetric Contraction:</strong> Pressure builds in ventricles (all valves closed)</li>
            <li><strong>Ejection:</strong> Semilunar valves open, blood ejected into aorta/pulmonary trunk</li>
          </ul>
        </li>
        <li><strong>Ventricular Diastole:</strong>
          <ul>
            <li><strong>Isovolumetric Relaxation:</strong> Ventricles relax (all valves closed)</li>
            <li><strong>Rapid Ventricular Filling:</strong> AV valves open, ~70% of filling occurs</li>
            <li><strong>Diastasis:</strong> Slow filling period before atrial contraction</li>
          </ul>
        </li>
      </ol>
      <p>Total duration: ~0.8 seconds at resting heart rate of 75 bpm. Duration shortens as heart rate increases, primarily by shortening diastole.</p>`
    },
    {
      id: topicId + 8,
      topic,
      question: `Describe the heart sounds and their clinical significance.`,
      answer: `<p><strong>Normal heart sounds:</strong></p>
      <ul>
        <li><strong>S1 ("lub"):</strong> Closure of AV valves (mitral and tricuspid) at beginning of systole. Best heard at apex.</li>
        <li><strong>S2 ("dub"):</strong> Closure of semilunar valves (aortic and pulmonary) at beginning of diastole. Best heard at base of heart.</li>
      </ul>
      <p><strong>Additional sounds (may indicate pathology):</strong></p>
      <ul>
        <li><strong>S3:</strong> Early diastolic filling sound. Normal in children/young adults but pathological in older adults (heart failure).</li>
        <li><strong>S4:</strong> Late diastolic sound due to atrial contraction against stiff ventricle. Indicates decreased ventricular compliance.</li>
      </ul>
      <p><strong>Murmurs:</strong> Abnormal sounds caused by turbulent blood flow, often due to valve stenosis or regurgitation. Characterized by timing, location, radiation, intensity, and quality.</p>`
    },
    {
      id: topicId + 9,
      topic,
      question: `What factors influence heart rate and contractility?`,
      answer: `<p><strong>Heart Rate Regulation:</strong></p>
      <ul>
        <li><strong>Autonomic Nervous System:</strong>
          <ul>
            <li>Sympathetic stimulation: Increases heart rate (β1-adrenergic receptors)</li>
            <li>Parasympathetic stimulation: Decreases heart rate (muscarinic receptors)</li>
          </ul>
        </li>
        <li><strong>Hormones:</strong> Epinephrine, norepinephrine, thyroid hormones (increase)</li>
        <li><strong>Temperature:</strong> Fever increases heart rate (~18 bpm increase per 1°C)</li>
        <li><strong>Electrolytes:</strong> Hypokalemia (increases), hyperkalemia (decreases)</li>
        <li><strong>Age:</strong> Generally decreases with age</li>
        <li><strong>Physical fitness:</strong> Lower resting heart rate in athletes</li>
      </ul>
      <p><strong>Contractility Regulation:</strong></p>
      <ul>
        <li><strong>Sympathetic stimulation:</strong> Increases contractility (positive inotropic effect)</li>
        <li><strong>Calcium levels:</strong> Higher Ca²⁺ = increased contractility</li>
        <li><strong>Medications:</strong> Digoxin, dobutamine (increase), beta-blockers (decrease)</li>
        <li><strong>Starling's Law:</strong> Preload affects contractility</li>
        <li><strong>Afterload:</strong> High afterload can reduce ejection fraction</li>
      </ul>`
    },
    {
      id: topicId + 10,
      topic,
      question: `Explain the electrocardiogram (ECG/EKG) waves and what they represent.`,
      answer: `<p><strong>ECG waves and their significance:</strong></p>
      <ul>
        <li><strong>P wave:</strong> Atrial depolarization</li>
        <li><strong>PR interval:</strong> Time from beginning of atrial depolarization to beginning of ventricular depolarization (normally 0.12-0.20 seconds)</li>
        <li><strong>QRS complex:</strong> Ventricular depolarization and atrial repolarization (normally 0.06-0.10 seconds)
          <ul>
            <li>Q wave: First negative deflection</li>
            <li>R wave: First positive deflection</li>
            <li>S wave: Negative deflection after R wave</li>
          </ul>
        </li>
        <li><strong>ST segment:</strong> Ventricles completely depolarized, plateau phase (normally isoelectric)</li>
        <li><strong>T wave:</strong> Ventricular repolarization</li>
        <li><strong>QT interval:</strong> Ventricular depolarization and repolarization (rate-dependent, normally 0.35-0.44 seconds)</li>
        <li><strong>U wave:</strong> Sometimes seen after T wave, may represent papillary muscle repolarization</li>
      </ul>
      <p>ECG abnormalities can indicate arrhythmias, conduction disorders, electrolyte imbalances, ischemia, infarction, chamber enlargement, or drug effects.</p>`
    }
  ];
  
  return flashcards;
}
