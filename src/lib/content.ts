export const stages = [
  {
    name: 'Launch', depth: 2, title: 'Clear of the surface.',
    text: 'Manta slips beneath the swell. Its paired horizontal thrusters spin up and the vehicle trims level before descending.',
    imageAlt: 'Manta just beneath the bright surface, with its lamps coming on.',
    channel: 'Thrusters online',
  },
  {
    name: 'Descent', depth: 14, title: 'Into the blue.',
    text: 'Sunlight falls away as Manta descends. Its lamps pick out suspended particles and the first shapes of the reef below.',
    imageAlt: 'Manta descending through darker blue water, with both lamps lit.',
    channel: 'Depth increasing',
  },
  {
    name: 'Survey', depth: 26, title: 'Read the reef.',
    text: 'The camera pod turns while an illuminated sweep crosses the reef. The pass gives the operator a reference for the sampling approach.',
    imageAlt: 'An aqua scanning plane passes through the reef while Manta holds position.',
    channel: 'Survey sweep',
  },
  {
    name: 'Sample', depth: 28, title: 'A precise pickup.',
    text: 'The shoulder and elbow guide the open gripper to a loose demonstration sample. The jaws close around it and the arm pulls it clear of the seabed.',
    imageAlt: 'Manta’s orange arm reaches toward a pale sample on the seabed, then carries it in the closed jaws.',
    channel: 'Manipulator active',
  },
  {
    name: 'Return', depth: 0, title: 'Back to the surface.',
    text: 'Manta gains altitude with the sample held in its gripper. The operator closes the session with the reef pass and sample recovery logged.',
    imageAlt: 'Manta ascends into brighter water with the sample still in its gripper.',
    channel: 'Mission complete',
  },
] as const;

export const parts = [
  { id: 'housing', title: 'Pressure housing', description: 'The sealed central canister contains the onboard electronics. External rails carry handling loads around it.' },
  { id: 'frame', title: 'Protective frame', description: 'The high-visibility cage and skid rails take first contact during launch, recovery and close reef work.' },
  { id: 'thrusters', title: 'Ducted thrusters', description: 'Paired horizontal ducts steer and translate the vehicle. Smaller vertical units control depth and trim.' },
  { id: 'camera', title: 'Camera pod', description: 'The independently turning pod points the optical assembly at the reef or the sampling arm.' },
  { id: 'lamps', title: 'Survey lamps', description: 'Two forward-facing lamps light the working area as daylight fades.' },
  { id: 'arm', title: 'Sampling arm', description: 'A yawing shoulder, elbow and opposing jaws let the operator retrieve a loose sample with a controlled reach.' },
] as const;

export type Part = (typeof parts)[number]['id'];

export const fleet = [
  { id: 'PR-01', name: 'Manta', role: 'Survey & intervention ROV', description: 'A compact, tethered platform for close observation and light sampling. Its open frame keeps the camera, lamps and manipulator easy to service.', depth: '120 m', size: '1.24 m', mass: '42 kg', image: '/media/manta.webp', alt: 'Three-quarter render of the orange-framed Manta ROV' },
  { id: 'PR-02', name: 'Needle', role: 'Linear survey AUV', description: 'A narrow, torpedo-shaped concept for steady transects along cables, pipelines and the edges of a survey area.', depth: '180 m', size: '1.58 m', mass: '31 kg', image: '/media/needle.webp', alt: 'Long ivory survey vehicle with tail fins and dark sensor nose' },
  { id: 'PR-03', name: 'Skate', role: 'Shallow-water observation ROV', description: 'A low-profile craft for sheltered shallows. Its wide wing and protected central camera give it a distinctive profile.', depth: '45 m', size: '0.86 m', mass: '18 kg', image: '/media/skate.webp', alt: 'Wide wing-shaped marine vehicle with teal panels and a central camera' },
] as const;

export const missions = [
  { slug: 'reef', title: 'Trace the reef edge', type: 'Reef mapping', location: 'Speyside, Tobago', image: '/media/reef.webp', alt: 'Sunlit Caribbean reef wall alongside open blue water', description: 'A visual transect follows the reef edge so researchers can revisit the same section on a later pass.', plan: 'Fly parallel to the slope at a steady stand-off. Record overlapping frames and depth along the route, then mark obvious landmarks for a repeat survey.', result: 'An illustrative image strip, a route log and a set of reference points for the next pass.' },
  { slug: 'infrastructure', title: 'Look along the line', type: 'Infrastructure inspection', location: 'Gulf of Paria', image: '/media/infrastructure.webp', alt: 'Submerged steel infrastructure lit through teal water', description: 'A close visual pass along a submerged structure documents surfaces and joints for a later engineering review.', plan: 'Begin with a wide orientation pass. Return along the same route to photograph joints and visible changes using oblique light.', result: 'A tagged photo log with location references and observations for follow-up.' },
  { slug: 'research', title: 'Bring a sample back', type: 'Marine research', location: 'North coast, Trinidad', image: '/media/research.webp', alt: 'A pale loose sample on a textured Caribbean seabed', description: 'The crew uses the manipulator to retrieve a loose reference sample from a preselected patch of bare seabed.', plan: 'Survey the approach, wait for sediment to settle and retrieve the loose specimen with a single controlled grip.', result: 'A demonstration sample and a record of where and how it was collected.' },
] as const;
