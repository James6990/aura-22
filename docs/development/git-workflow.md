# Apex Git Workflow

## Branches

### `main`

Production-ready and protected.

### `apex-foundation-1.0`

Primary active development branch until the foundation is ready to merge.

### `experimental`

Reserved for isolated high-risk experiments when needed.

## Checkpoint process

Build  
→ Test  
→ Typecheck  
→ Update documentation  
→ Run documentation checks  
→ Run Git diff checks  
→ Commit  
→ Push  
→ Add a checkpoint tag when appropriate

## Commit principle

Each commit should represent one coherent and tested milestone.
