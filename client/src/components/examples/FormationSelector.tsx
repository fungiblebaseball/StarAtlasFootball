import { useState } from 'react';
import FormationSelector from '../FormationSelector';

export default function FormationSelectorExample() {
  const [selected, setSelected] = useState("442");

  return (
    <div>
      <FormationSelector 
        selected={selected} 
        onSelect={(formation) => {
          setSelected(formation);
          console.log('Selected formation:', formation);
        }} 
      />
      <p className="mt-4 text-sm text-muted-foreground">Selected: {selected}</p>
    </div>
  );
}
